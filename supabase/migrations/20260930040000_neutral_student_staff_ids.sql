-- Neutral, year-independent identifiers.
--   Student ID: STU-000001      Staff ID: EMP-000001
-- Neither embeds a school name/initials or an academic year, so they stay valid
-- however the academic year is configured. Uniqueness under concurrent inserts is
-- guaranteed by the existing sequences (nextval is atomic) plus the unique
-- constraints on students.student_id and staff.employee_number.
-- Forward-only: existing rows keep the identifier they were issued; only newly
-- generated values use the new format. Sequences are not reset, so numbers never repeat.

create or replace function public.generate_student_id()
returns text
language sql
as $$
  select 'STU-' || lpad(nextval('public.student_number_seq')::text, 6, '0');
$$;

comment on function public.generate_student_id is
  'Student code STU-{6-digit sequence}. Neutral (no school name, no academic year); unique via student_number_seq.';

create or replace function public.assign_employee_number()
returns trigger
language plpgsql
as $$
begin
  if new.employee_number is null then
    new.employee_number := 'EMP-' || lpad(nextval('public.staff_employee_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

comment on function public.assign_employee_number is
  'Staff code EMP-{6-digit sequence}, assigned on insert when not supplied; unique via staff_employee_seq.';
