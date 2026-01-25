import type { NextApiRequest, NextApiResponse } from "next";
import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env["MUX_TOKEN_ID"],
  tokenSecret: process.env["MUX_TOKEN_SECRET"],
  webhookSecret: process.env["MUX_WEBHOOK_SECRET"],
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify webhook signature
    const signature = req.headers["mux-signature"] as string;
    const event = Mux.webhooks.verify(
      JSON.stringify(req.body),
      signature,
      process.env["MUX_WEBHOOK_SECRET"]!,
    );

    // When asset is ready
    if (event.type === "video.asset.ready") {
      const assetId = event.data.id;

      // TODO: Save assetId to your database here
      console.log("Asset ready:", assetId);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(400).json({ error: "Webhook verification failed" });
  }
}
