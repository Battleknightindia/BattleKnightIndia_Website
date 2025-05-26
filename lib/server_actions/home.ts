import { createClient } from "@/utils/supabase/server";

export async function handleBannerImageUpload(bannerimage: File | null){
    const supabase = await createClient();
    const filename = `featured/`+(bannerimage ? bannerimage.name : "default.png");
    try{
        if(bannerimage){
            const { error: imageError } = await supabase.storage
            .from("home")
            .upload(filename, bannerimage,{
            upsert: true, // Use upsert to replace existing file
        });
        if (imageError) {
            console.error("Error uploading image:", imageError);
            return ;
        }
        }
      const { data: publicUrlData } = supabase.storage
      .from('home')
      .getPublicUrl(filename);
      const publicUrl = publicUrlData.publicUrl;
      return publicUrl;
    }
    catch(e){}
}