export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { addYears, isBefore, addMonths, formatISO } from "date-fns";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const today = new Date();
  const in30days = addMonths(today, 1);

  const { data: equipment } = await supabase
    .from("equipment")
    .select("*, equipment_types(*), profiles!equipment_user_id_fkey(user_id)")
    .neq("status", "retired");

  let created = 0;

  for (const eq of equipment ?? []) {
    const type = eq.equipment_types;
    const expiryDates: Date[] = [];

    if (type.max_lifetime_years && eq.manufacture_date) expiryDates.push(addYears(new Date(eq.manufacture_date), type.max_lifetime_years));
    if (type.max_use_lifetime_years && eq.first_use_date) expiryDates.push(addYears(new Date(eq.first_use_date), type.max_use_lifetime_years));

    for (const expiry of expiryDates) {
      if (isBefore(expiry, in30days)) {
        const dueDate = formatISO(expiry, { representation: "date" });
        const { data: existing } = await supabase.from("alerts").select("id").eq("equipment_id", eq.id).eq("alert_type", "expiration").eq("due_date", dueDate).single();
        if (!existing) {
          await supabase.from("alerts").insert({ user_id: eq.user_id, equipment_id: eq.id, alert_type: "expiration", due_date: dueDate });
          created++;
          if (eq.status !== "to_replace") {
            await supabase.from("equipment").update({ status: "to_replace" }).eq("id", eq.id);
          }
        }
      }
    }
  }

  const { data: dueInspections } = await supabase
    .from("inspections")
    .select("equipment_id, next_inspection_date, equipment(user_id)")
    .not("next_inspection_date", "is", null)
    .lte("next_inspection_date", formatISO(in30days, { representation: "date" }));

  for (const ins of dueInspections ?? []) {
    const { data: existing } = await supabase.from("alerts").select("id").eq("equipment_id", ins.equipment_id).eq("alert_type", "inspection").eq("due_date", ins.next_inspection_date).single();
    if (!existing) {
      const eq = ins.equipment as any;
      await supabase.from("alerts").insert({ user_id: eq.user_id, equipment_id: ins.equipment_id, alert_type: "inspection", due_date: ins.next_inspection_date });
      created++;
      await supabase.from("equipment").update({ status: "inspect_soon" }).eq("id", ins.equipment_id);
    }
  }

  return NextResponse.json({ ok: true, alerts_created: created });
}
