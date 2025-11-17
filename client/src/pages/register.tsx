import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApp } from "@/providers/AppProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff, Building, User, Users, UserCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { normalizeUserType, requiresCompanyName } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/language-selector";
import type { UserType as CanonicalUserType } from "@shared/user";

type StrictUserType = CanonicalUserType;

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  userType: StrictUserType;
  companyName?: string;
  termsAccepted: boolean;
};

// Define user type options with backend-compatible values
const userTypeOptionsBase = [
  {
    value: "BEDRIJF" as const,
    frontendValue: "employer" as const,
    icon: Building,
  },
  {
    value: "ZZP" as const,
    frontendValue: "zzp" as const,
    icon: User,
  },
  {
    value: "BUREAU" as const,
    frontendValue: "bureau" as const,
    icon: Users,
  },
  {
    value: "SOLLICITANT" as const,
    frontendValue: "werkzoekende" as const,
    icon: UserCheck,
  },
] as const satisfies ReadonlyArray<{
  value: StrictUserType;
  frontendValue: string;
  icon: typeof Building;
}>;

const canonicalUserTypeValues = userTypeOptionsBase.map((option) => option.value) as [
  StrictUserType,
  ...StrictUserType[]
];

export default function Register() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { register, isLoading } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  
  // Create user type options with translations
  const userTypeOptions = userTypeOptionsBase.map(option => ({
    ...option,
    label: t(`userTypes.${option.frontendValue}`),
    description: t(`userTypes.${option.frontendValue}Description`)
  }));

  // Get preselected user type from sessionStorage
  const preselectedUserType = sessionStorage.getItem("selectedUserType");
  const normalizedPreselectedUserType = normalizeUserType(preselectedUserType) ?? "BEDRIJF";

  // Create a new schema that includes termsAccepted
  const registerFormSchema = z.object({
    name: z.string().min(1, "Naam is verplicht"),
    email: z.string().email("Ongeldig e-mailadres"),
    password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters bevatten"),
    userType: z.enum(canonicalUserTypeValues),
    companyName: z.string().optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "U moet akkoord gaan met de algemene voorwaarden",
    }),
  }).superRefine((data, ctx) => {
    if (requiresCompanyName(data.userType) && (!data.companyName || data.companyName.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bedrijfsnaam is verplicht voor bedrijven en bureaus",
        path: ["companyName"],
      });
    }
  });

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userType: normalizedPreselectedUserType,
      companyName: "",
      termsAccepted: false,
    },
  });

  // Clear sessionStorage after using the values
  useEffect(() => {
    if (preselectedUserType) {
      sessionStorage.removeItem("selectedUserType");
    }
  }, [preselectedUserType]);

  const watchedUserType = form.watch("userType");
  const showCompanyName = requiresCompanyName(watchedUserType);

  const onSubmit = async (data: RegisterFormData) => {
    // Remove termsAccepted from the data before sending to register
    const { termsAccepted, ...userData } = data;

    // Cast userType to proper User type (already validated in form schema)
    const registrationData = {
      ...userData,
      userType: userData.userType as 'BEDRIJF' | 'ZZP' | 'BUREAU' | 'SOLLICITANT'
    };

    const success = await register(registrationData);
    if (success) {
      // All users go to dashboard after successful registration
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50 light">
      <Card className="w-full max-w-md shadow-xl border-0 backdrop-blur-sm bg-white relative">
        {/* Language Selector in top-right corner of card */}
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>
        <CardHeader className="text-center pb-8">
          <div className="text-2xl font-bold text-gradient mb-2">TalentMarkt</div>
          <CardTitle className="text-3xl font-bold text-foreground">
            {t('auth.createAccount')}
          </CardTitle>
          <p className="mt-2 text-muted-foreground">
{t('auth.findTalentOrJobs')}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-register">
              {/* User Type Selection */}
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium !text-gray-700">
                      {t('auth.selectAccountType')}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-1 gap-3"
                      >
                        {userTypeOptions.map((option) => {
                          const isSelected = field.value === option.value;
                          return (
                            <FormItem key={option.value} className="space-y-0">
                              <FormControl>
                                <label 
                                  className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                                    isSelected 
                                      ? 'border-primary bg-primary/10 shadow-md' 
                                      : 'border-gray-300 hover:bg-background hover:shadow-sm'
                                  }`}
                                  onClick={() => field.onChange(option.value)}
                                >
                                  <RadioGroupItem
                                    value={option.value}
                                    className="absolute opacity-0 pointer-events-none"
                                    data-testid={`radio-user-type-${option.value.toLowerCase()}`}
                                  />
                                  <div className="flex items-center w-full">
                                    <option.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                                      isSelected 
                                        ? 'text-primary' 
                                        : 'text-gray-600'
                                    }`} />
                                    <div className="flex-1">
                                      <div className={`font-medium ${
                                        isSelected 
                                          ? 'text-gray-900' 
                                          : 'text-gray-900'
                                      }`}>
                                        {option.label}
                                      </div>
                                      <div className={`text-sm ${
                                        isSelected 
                                          ? 'text-primary' 
                                          : 'text-gray-600'
                                      }`}>
                                        {option.description}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <div className="ml-3">
                                        <div className="w-4 h-4 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                                          <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </label>
                              </FormControl>
                            </FormItem>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Personal Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voor- en achternaam *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Jan Janssen"
                          data-testid="input-name"
                          className="bg-white !text-black placeholder:!text-gray-500 border-gray-300 focus:bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCompanyName && (
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrijfsnaam *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Innovatief Tech BV"
                            data-testid="input-company-name"
                            className="bg-white !text-black placeholder:!text-gray-500 border-gray-300 focus:bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mailadres *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="jan@voorbeeld.nl"
                          data-testid="input-email"
                          className="bg-white !text-black placeholder:!text-gray-500 border-gray-300 focus:bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wachtwoord *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Minimaal 8 karakters"
                            data-testid="input-password"
                            className="bg-white !text-black placeholder:!text-gray-500 border-gray-300 focus:bg-white"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        Minimaal 8 karakters
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Terms and Conditions */}
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-terms"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <label
                        className="text-sm text-gray-600 cursor-pointer"
                        onClick={() => field.onChange(!field.value)}
                      >
                        Ik ga akkoord met de{" "}
                        <a href="#" className="text-primary-600 hover:text-primary-500 underline" onClick={(e) => e.stopPropagation()}>
                          algemene voorwaarden
                        </a>{" "}
                        en{" "}
                        <a href="#" className="text-primary-600 hover:text-primary-500 underline" onClick={(e) => e.stopPropagation()}>
                          privacybeleid
                        </a>
                      </label>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                disabled={isLoading}
                data-testid="button-register"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Account aanmaken
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Heeft u al een account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium" data-testid="link-to-login">
                Inloggen
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
