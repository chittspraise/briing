ALTER TABLE public.travel
ADD CONSTRAINT fk_profiles
FOREIGN KEY (user_id)
REFERENCES public.profiles(id);
