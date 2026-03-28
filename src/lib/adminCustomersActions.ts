"use server"

import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function getAdminCustomersAction() {
  const { data: profiles, error: pError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  const { data: orders, error: oError } = await supabaseAdmin
    .from('orders')
    .select('customer_id, contact_number, total_amount, created_at')

  if (pError || oError) throw new Error((pError || oError)?.message)

  return { profiles: profiles || [], orders: orders || [] }
}

export async function updateCustomerStatusAction(id: string, newStatus: string) {
  const { error } = await supabaseAdmin.from('profiles').update({ status: newStatus }).eq('id', id)
  if (error) throw new Error(error.message)
  return true
}

export async function deleteCustomerAction(id: string) {
  const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}
