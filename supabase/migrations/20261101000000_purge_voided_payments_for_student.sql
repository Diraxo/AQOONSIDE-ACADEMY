-- Lets a student be permanently deleted once every payment on file for them has been voided.
-- payment_allocations.obligation_id is ON DELETE RESTRICT, so the student's allocations on VOIDED
-- receipts must be removed first. Refuses if any POSTED (live) payment still funds the student.
-- A voided receipt that has no allocations left afterwards is removed too (its audit rows cascade).
create or replace function public.purge_voided_payments_for_student(p_student_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if not (public.is_owner_or_admin() or public.is_owner_or_finance()) then
    raise exception 'Only the Owner, Director or Finance may delete a student';
  end if;

  if exists (
    select 1 from public.payment_allocations pa
    join public.payments p on p.id = pa.payment_id
    join public.student_fee_obligations o on o.id = pa.obligation_id
    where o.student_id = p_student_id and p.status <> 'VOIDED'
  ) then
    raise exception 'This student still has payments that are not voided';
  end if;

  with del as (
    delete from public.payment_allocations pa
    using public.payments p, public.student_fee_obligations o
    where pa.payment_id = p.id and pa.obligation_id = o.id
      and o.student_id = p_student_id and p.status = 'VOIDED'
    returning pa.payment_id
  )
  select count(distinct payment_id) into v_count from del;

  delete from public.payments p
   where p.status = 'VOIDED'
     and not exists (select 1 from public.payment_allocations pa where pa.payment_id = p.id)
     and p.id in (select payment_id from public.payment_audit_log where p_student_id = any (student_ids));

  return coalesce(v_count, 0);
end;
$$;

revoke all on function public.purge_voided_payments_for_student(uuid) from public, anon;
grant execute on function public.purge_voided_payments_for_student(uuid) to authenticated;
