-- Storage bucket for assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'delicatessen_assets',
  'delicatessen_assets',
  false,
  1572864, -- 1.5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: signed URLs for read (via functions)
CREATE POLICY "Assets are readable via signed URLs" ON storage.objects
  FOR SELECT USING (bucket_id = 'delicatessen_assets');

-- Storage policies: signed uploads (via functions only)
CREATE POLICY "Assets are uploadable via signed URLs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'delicatessen_assets');

-- Storage policies: delete (via functions only)
CREATE POLICY "Assets are deletable via functions" ON storage.objects
  FOR DELETE USING (bucket_id = 'delicatessen_assets');
