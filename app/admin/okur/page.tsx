import type { Metadata } from "next";
import Panel from "./Panel";

export const metadata: Metadata = { title: "Yönetim", robots: { index: false, follow: false } };

export default function Yonetim() {
  return <Panel />;
}
