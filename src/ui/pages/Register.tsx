import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Lock, Mail, Rocket, User as UserIcon } from "lucide-react";
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
      setError("Access codes do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Access code must be at least 6 characters");
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
      setError(err instanceof Error ? err.message : "Failed to enlist in the mission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <StarField className="absolute inset-0" density={1} />
        <Aurora intensity="medium" variant="cyan" />
        <Comet top="18%" duration={12} delay="-1s" size="lg" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6 lg:px-12">
        <ArtemisLogo tagline="Mission Control" />
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Already enlisted?{" "}
          <Link to="/login" className="font-medium text-foreground hover:text-primary transition-colors">
            Return to Mission →
          </Link>
        </span>
      </header>

      <main className="relative z-10 grid min-h-[calc(100vh-7rem)] grid-cols-1 items-center gap-8 px-6 pb-12 pt-4 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:px-16">
        <section className="relative flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <span className="artemis-tag mb-6">
              <Rocket className="h-3 w-3" /> Enlistment · New Operator
            </span>
            <h1 className="font-display text-[clamp(2.4rem,5.5vw,4.4rem)] font-light leading-[0.95] tracking-[-0.035em]">
              <span className="artemis-text-lunar">Join the</span>
              <br />
              <span className="artemis-text-aurora">Artemis crew.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed">
              Every great mission starts with a crew. Enlist now and gain access
              to your fleet's mission control — telemetry, trajectory, and
              everything in between.
            </p>
          </motion.div>

          <div className="pointer-events-none absolute -right-12 -bottom-32 hidden lg:block">
            <MoonOrb size={360} phase="aurora" />
          </div>
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
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Crew Enlistment
                </p>
                <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.01em]">
                  Create Operator File
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Operator Name
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
                      placeholder="Cmdr. Jane Doe"
                      disabled={isSubmitting}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Operator ID
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
                      placeholder="commander@artemis.io"
                      disabled={isSubmitting}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Mission Role
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
                      <SelectItem value={UserRole.DEVELOPER}>Engineer · Developer</SelectItem>
                      <SelectItem value={UserRole.TECH_LEAD}>Tech Lead · Flight Director</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Admin · Mission Commander</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Access Code
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
                    <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Confirm Code
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

                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  size="lg"
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Enlisting in mission...
                    </>
                  ) : (
                    <>
                      Enlist & Launch
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground sm:hidden">
                Already enlisted?{" "}
                <Link to="/login" className="font-medium text-foreground hover:text-primary">
                  Return to Mission
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
