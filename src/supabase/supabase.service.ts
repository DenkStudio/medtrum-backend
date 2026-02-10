import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private readonly _client: SupabaseClient;
  private readonly _adminClient: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const secretKey = process.env.SUPABASE_SECRET_KEY!;

    this._client = createClient(supabaseUrl, publishableKey);
    this._adminClient = createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  get client(): SupabaseClient {
    return this._client;
  }

  get adminClient(): SupabaseClient {
    return this._adminClient;
  }
}
