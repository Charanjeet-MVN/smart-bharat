import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Must be a valid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase Anon Key is required"),
  GOOGLE_GEMINI_API_KEY: z.string().min(1, "Google Gemini API Key is required").optional(),
  GEMINI_API_KEY: z.string().min(1, "Gemini API Key is required").optional(),
  OPENROUTER_API_KEY: z.string().min(1, "OpenRouter API Key is required").optional(),
  NVIDIA_API_KEY: z.string().min(1, "NVIDIA API Key is required").optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "Clerk Publishable Key is required"),
  CLERK_SECRET_KEY: z.string().min(1, "Clerk Secret Key is required"),
}).refine((data) => data.GOOGLE_GEMINI_API_KEY || data.GEMINI_API_KEY || data.OPENROUTER_API_KEY || data.NVIDIA_API_KEY, {
  message: "An AI API key (GOOGLE_GEMINI_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY) must be provided",
});

const parseEnv = () => {
  // During build time on Vercel/Next.js, some keys might be missing. 
  // We handle parsing and throw if invalid during runtime.
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
    try {
      const env = envSchema.parse(process.env);
      return env;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("❌ Invalid environment variables:", error.issues);
      }
      // For Next.js build process compatibility, we might not want to crash the build entirely,
      // but in runtime, this ensures we have what we need.
      if (process.env.NODE_ENV === "production") {
        throw new Error("Invalid environment variables. See logs above.");
      }
    }
  }
  return process.env as unknown as z.infer<typeof envSchema>;
};

export const env = parseEnv();
