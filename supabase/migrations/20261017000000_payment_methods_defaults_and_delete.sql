-- Payment methods: replace the Somaliland defaults with the methods printed on the receipt pad
-- (Cash, HelloCash, E-birr, Sahay, E-sahal, ACC/Bank, Kaafi), and let Owner/Finance delete a method.
-- "Other" is no longer a stored row: the Record Payment form always offers "Other" (type a name).

-- 1) Owner/Finance may delete. payments.payment_method_id is ON DELETE RESTRICT, so a method that
--    already has payments cannot be deleted (history stays intact) -- the UI offers Deactivate instead.
create policy payment_methods_delete on public.payment_methods for delete using (public.is_owner_or_finance());
grant delete on public.payment_methods to authenticated;

-- 2) The receipt-pad defaults.
insert into public.payment_methods (name, active) values
  ('Cash', true), ('HelloCash', true), ('E-birr', true), ('Sahay', true),
  ('E-sahal', true), ('ACC/Bank', true), ('Kaafi', true)
on conflict (name) do update set active = true;

-- 3) Remove the old Somaliland defaults (and the stored "Other"). Ones already used by a payment
--    are only deactivated so history is kept.
delete from public.payment_methods pm
 where pm.name in ('EVC Plus', 'eDahab', 'Zaad', 'Bank Transfer', 'Other')
   and not exists (select 1 from public.payments p where p.payment_method_id = pm.id);

update public.payment_methods set active = false
 where name in ('EVC Plus', 'eDahab', 'Zaad', 'Bank Transfer', 'Other');
