// Base44 to Supabase Adapter Client
// Translates legacy Base44 SDK calls into native Supabase client queries.

import { supabase } from "@/api/supabaseClient";

function camelToSnake(str) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .toLowerCase();
}

const entityProxy = new Proxy({}, {
  get(target, entityName) {
    const tableName = camelToSnake(entityName);
    
    return {
      async create(data) {
        try {
          const { data: created, error } = await supabase
            .from(tableName)
            .insert(data)
            .select()
            .single();
          if (error) {
            // Fallback for tables that don't allow public SELECT (e.g. contact_message, stay_report)
            if (error.code === '42501' || error.message?.includes('violates row-level security')) {
              const { error: insertError } = await supabase
                .from(tableName)
                .insert(data);
              if (insertError) throw insertError;
              return null;
            }
            throw error;
          }
          return created;
        } catch (err) {
          if (err.code === '42501' || err.message?.includes('violates row-level security')) {
            const { error: insertError } = await supabase
              .from(tableName)
              .insert(data);
            if (insertError) throw insertError;
            return null;
          }
          throw err;
        }
      },

      async update(id, data) {
        // Intercept counter & confirmation updates blocked by RLS policies
        // and route them through secure SECURITY DEFINER RPC functions.
        if (tableName === 'ad') {
          if ('impression_count' in data) {
            const { error } = await supabase.rpc('increment_ad_impression', { ad_id: id });
            if (error) throw error;
            return { id, ...data };
          }
          if ('click_count' in data) {
            const { error } = await supabase.rpc('increment_ad_click', { ad_id: id });
            if (error) throw error;
            return { id, ...data };
          }
        } else if (tableName === 'local_listing') {
          if ('report_count' in data) {
            const { error } = await supabase.rpc('increment_local_listing_report', { listing_id: id });
            if (error) throw error;
            return { id, ...data };
          }
        } else if (tableName === 'job_alert') {
          if ('report_count' in data) {
            const { error } = await supabase.rpc('increment_job_alert_report', { job_id: id });
            if (error) throw error;
            return { id, ...data };
          }
        } else if (tableName === 'emergency_post') {
          if ('confirm_count' in data) {
            const { error } = await supabase.rpc('increment_emergency_confirm', { post_id: id });
            if (error) throw error;
            return { id, ...data };
          }
        } else if (tableName === 'scam_alert') {
          if ('confirm_count' in data) {
            const { error } = await supabase.rpc('increment_scam_confirm', { post_id: id });
            if (error) throw error;
            return { id, ...data };
          }
        } else if (tableName === 'situation_update') {
          if ('confirm_count' in data) {
            const { error } = await supabase.rpc('increment_situation_confirm', { post_id: id });
            if (error) throw error;
            return { id, ...data };
          }
        } else if (tableName === 'user') {
          if ('role' in data) {
            const { error } = await supabase.rpc('update_user_role', { user_id: id, new_role: data.role });
            if (error) throw error;
            return { id, ...data };
          }
        } else if (tableName === 'discussion_reply') {
          if ('helpful_count' in data) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
              return { id, ...data };
            }
            const actorId = session.user.id;
            const { data: existing } = await supabase
              .from("reaction")
              .select("id")
              .eq("target_id", id)
              .eq("target_type", "discussion_reply")
              .eq("reaction_type", "helpful")
              .eq("actor_id", actorId)
              .maybeSingle();

            if (existing) {
              await supabase.from("reaction").delete().eq("id", existing.id);
            } else {
              await supabase.from("reaction").insert({
                target_id: id,
                target_type: "discussion_reply",
                reaction_type: "helpful",
                actor_id: actorId,
                is_authenticated: true
              });
            }
            return { id, ...data };
          }
        } else if (tableName === 'community_discussion') {
          if ('reply_count' in data) {
            // Handled by database trigger on discussion_reply table
            return { id, ...data };
          }
        }

        const { data: updated, error } = await supabase
          .from(tableName)
          .update(data)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return updated;
      },

      async delete(id) {
        const { data, error } = await supabase
          .from(tableName)
          .delete()
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      },

      async filter(queryObj, sort, limit) {
        let query = supabase.from(tableName).select("*");
        
        if (queryObj) {
          for (const [key, val] of Object.entries(queryObj)) {
            if (val === null) {
              query = query.is(key, null);
            } else {
              query = query.eq(key, val);
            }
          }
        }

        if (sort) {
          const orderCol = sort.startsWith("-") ? sort.substring(1) : sort;
          const ascending = !sort.startsWith("-");
          query = query.order(orderCol, { ascending });
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },

      async list(sort, limit) {
        return this.filter(null, sort, limit);
      }
    };
  }
});

const authMock = {
  async me() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
      profile_image: session.user.user_metadata?.avatar_url || null,
      role: session.user.user_metadata?.role || 'user'
    };
  },
  async logout() {
    await supabase.auth.signOut();
    window.location.reload();
  },
  redirectToLogin() {
    window.location.href = '/';
  }
};

const integrationsMock = {
  Core: {
    async UploadFile({ file }) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('media').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
      let file_url = publicUrl;
      if (file_url && !file_url.includes('/storage/v1/object/public/')) {
        file_url = file_url.replace('/storage/v1/object/media/', '/storage/v1/object/public/media/');
      }
      return { file_url };
    },

    async SendEmail({ to, subject, body, from_name }) {
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: to,
            subject: subject,
            text: body,
          }),
        });
        if (!response.ok) {
          const errData = await response.json();
          console.error("Failed to send email via API:", errData);
          throw new Error(errData.error?.message || "Failed to send email");
        }
        return await response.json();
      } catch (err) {
        console.error("Error sending email in SendEmail integration:", err);
        throw err;
      }
    }
  }
};

export const base44 = {
  entities: entityProxy,
  auth: authMock,
  integrations: integrationsMock
};
