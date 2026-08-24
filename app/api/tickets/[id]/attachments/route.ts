import { NextResponse } from "next/server";
import {
	addAttachment,
	getTicket,
	getTicketAttachments,
} from "@/lib/db/tickets";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";
import { uploadFile, generateDownloadUrl } from "@/lib/s3/client";

const bucket = process.env.S3_BUCKET || "bug-tracker";

async function getAccessibleTicket(req: AuthenticatedRequest) {
	const id = req.nextUrl.pathname.split("/").slice(-3)[0];
	if (!id) return { id: null, ticket: null };
	const ticket = await getTicket(id);
	if (
		!ticket ||
		(req.user?.role === "client" && ticket.clientId !== req.user.userId)
	) {
		return { id, ticket: null };
	}
	return { id, ticket };
}

export const GET = withAuth(async (req: AuthenticatedRequest) => {
	try {
		const { id, ticket } = await getAccessibleTicket(req);
		if (!id)
			return NextResponse.json(
				{ error: "Ticket ID is required" },
				{ status: 400 },
			);
		if (!ticket)
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		const attachments = await getTicketAttachments(id);
		const result = await Promise.all(
			attachments.map(async (attachment) => ({
				...attachment,
				downloadUrl: await generateDownloadUrl(bucket, attachment.s3Key),
			})),
		);
		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching attachments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch attachments" },
			{ status: 500 },
		);
	}
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
	try {
		const { id, ticket } = await getAccessibleTicket(req);
		if (!id)
			return NextResponse.json(
				{ error: "Ticket ID is required" },
				{ status: 400 },
			);
		if (!ticket)
			return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
		const formData = await req.formData();
		const file = formData.get("file");
		if (!(file instanceof File) || file.size === 0) {
			return NextResponse.json(
				{ error: "A file is required" },
				{ status: 400 },
			);
		}
		if (file.size > 10 * 1024 * 1024) {
			return NextResponse.json(
				{ error: "File must be 10MB or smaller" },
				{ status: 400 },
			);
		}
		const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
		const s3Key = `${id}/${crypto.randomUUID()}-${safeName}`;
		await uploadFile(
			bucket,
			s3Key,
			Buffer.from(await file.arrayBuffer()),
			file.type || "application/octet-stream",
		);
		const attachment = await addAttachment({
			ticketId: id,
			uploadedBy: req.user!.userId,
			fileName: file.name,
			s3Key,
			fileSize: file.size,
			mimeType: file.type || "application/octet-stream",
		});
		return NextResponse.json(
			{ ...attachment, downloadUrl: await generateDownloadUrl(bucket, s3Key) },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error uploading attachment:", error);
		return NextResponse.json(
			{ error: "Failed to upload attachment" },
			{ status: 500 },
		);
	}
});
