import { redirect } from "next/navigation";

export default function PermissionsIndexPage() {
  redirect("/admin/access/permissions");
}
