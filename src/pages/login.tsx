import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, Fingerprint } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export function LoginPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const from = location.state?.from?.pathname || "/admin";

  useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setIsBiometricSupported(available);
        })
        .catch(() => setIsBiometricSupported(false));
    }
  }, []);

  const handleSuccess = () => {
    signIn();
    navigate(from, { replace: true });
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate small network delay for UX
    await new Promise((r) => setTimeout(r, 400));

    if (pin === "duokarma5453") {
      handleSuccess();
    } else {
      setError("Incorrect PIN.");
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // We use a dummy challenge since there is no backend to verify.
      // This will trigger the device's native fingerprint/FaceID prompt.
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "DuoKarma Hub", id: window.location.hostname },
          user: {
            id: new Uint8Array(16),
            name: "admin",
            displayName: "Admin",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      });

      // If promise resolves, the user successfully scanned their fingerprint
      handleSuccess();
    } catch (err) {
      console.error(err);
      setError("Biometric authentication failed or was canceled.");
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[var(--color-void)] lg:grid-cols-2">
      {/* ── Left: Brand Panel ── */}
      <div className="hidden flex-col justify-between p-12 bg-[var(--color-graphite)] border-r border-[var(--color-edge)] lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md">
            <img src="/logo.jpeg" alt="DuoKarma" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">DuoKarma</p>
            <p className="text-[10px] text-ink-faint">Business Hub</p>
          </div>
        </div>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-3xl font-semibold leading-tight tracking-tight text-ink"
          >
            Your business,
            <br />
            <span className="text-[var(--color-accent)]">fully orchestrated.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="mt-4 text-sm leading-relaxed text-ink-faint"
          >
            Clients, projects, and revenue — unified in one professional workspace.
          </motion.p>
        </div>

        <p className="text-[11px] text-ink-faint">
          © {new Date().getFullYear()} DuoKarma. All rights reserved.
        </p>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[360px]"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md">
              <img src="/logo.jpeg" alt="DuoKarma" className="h-full w-full object-cover" />
            </div>
            <p className="text-sm font-semibold text-ink">DuoKarma</p>
          </div>

          <h2 className="text-xl font-semibold text-ink">Admin Access</h2>
          <p className="mt-1 text-sm text-ink-faint">Enter PIN or use fingerprint</p>

          {error && (
            <div className="mt-6 rounded-[var(--radius-control)] border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#EF4444]">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-dim">Master PIN</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 text-center tracking-widest text-lg"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Unlock <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>

          {isBiometricSupported && (
            <div className="mt-6">
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[var(--color-edge)]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[var(--color-void)] px-2 text-[10px] uppercase tracking-wider text-ink-faint">
                    Or use device
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBiometricLogin}
                disabled={isLoading}
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                Unlock with Fingerprint
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
