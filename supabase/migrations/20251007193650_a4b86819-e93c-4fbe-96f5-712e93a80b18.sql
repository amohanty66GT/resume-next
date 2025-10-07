-- Create a storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true);

-- Allow anyone to view profile images (bucket is public)
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow anyone to upload profile images
CREATE POLICY "Anyone can upload profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');

-- Allow anyone to update their uploaded images
CREATE POLICY "Anyone can update profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images');

-- Allow anyone to delete profile images
CREATE POLICY "Anyone can delete profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images');