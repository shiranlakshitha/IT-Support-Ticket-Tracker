import type { Metadata } from "next";
import { TicketDetails } from "@/components/TicketDetails";

export const metadata: Metadata = {
  title: "Ticket details",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetails ticketId={id} />;
}
