import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApp } from "@/providers/AppProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const { t } = useTranslation();
  const { forgotPassword, isLoading } = useApp();

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    const success = await forgotPassword(data.email);
    if (success) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('auth.forgotPassword')}</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.emailAddress')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}