import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail, User as UserIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/auth.types";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Button } from "@/ui/components/ui/button";
import { Alert, AlertDescription } from "@/ui/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/ui/select";
import {
  ArtemisLogo,
  Aurora,
  Comet,
  MoonOrb,
  StarField,
} from "@/ui/components/cosmic";

const Register = () => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: UserRole.DEVELOPER as UserRole,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <StarField className="absolute inset-0 opacity-60" density={0.7} />
        <Aurora intensity="soft" variant="iris" />

        {/* Hero planet — large, off-screen left, behind everything */}
        <div className="absolute -left-[28vw] top-1/2 hidden -translate-y-1/2 lg:block">
          <MoonOrb size={880} variant="iris" rings opacity={0.55} />
        </div>

        <div className="absolute left-[20vw] bottom-[10%] hidden xl:block">
          <MoonOrb size={200} variant="rose" opacity={0.4} float />
        </div>

        <Comet top="22%" duration={14} delay="-1s" size="lg" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background)/0.85)_100%)]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6 lg:px-12">
        <ArtemisLogo />
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground transition-colors hover:text-primary">
            Sign in →
          </Link>
        </span>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-12 pt-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-12">
        <section className="relative flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/30 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent))]" />
              Free for small teams
            </span>
            <h1 className="mt-6 font-display text-[clamp(2.4rem,5.4vw,4.4rem)] font-light leading-[0.98] tracking-[-0.035em]">
              <span className="artemis-text-lunar">Built for teams</span>
              <br />
              <span className="artemis-text-aurora">that ship.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Velocity, complexity and team health — together in one place,
              quietly, without getting in the way.
            </p>
          </motion.div>
        </section>

        <section className="relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md"
          >
            <div aria-hidden className="absolute -inset-1 rounded-[28px] bg-aurora-gradient opacity-30 blur-2xl" />
            <div className="artemis-panel relative overflow-hidden rounded-[28px] p-8 sm:p-9">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-medium tracking-[-0.01em]">
                  Create your account
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Get started in a minute.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Full name
                  </Label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      disabled={isSubmitting}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      disabled={isSubmitting}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Role
                  </Label>
                  <Select
                    name="role"
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.DEVELOPER}>Developer</SelectItem>
                      <SelectItem value={UserRole.TECH_LEAD}>Tech Lead</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Confirm
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isSubmitting || isLoading} size="lg" className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground sm:hidden">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-foreground hover:text-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Register;
