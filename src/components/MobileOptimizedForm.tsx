import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  propertyType: z.string().min(1, 'Please select a property type'),
  budget: z.string().min(1, 'Budget is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof formSchema>;

export function MobileOptimizedForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      propertyType: '',
      budget: '',
      message: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Form submitted successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container-responsive py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-responsive-xl font-bold mb-4">
            Mobile-Optimized Contact Form
          </h1>
          <p className="text-responsive-lg text-muted-foreground">
            This form demonstrates all mobile optimization features
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mobile-form">
            
            {/* Name Fields - Side by side on larger screens */}
            <div className="mobile-stack">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your first name" 
                        inputType="text"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your last name" 
                        inputType="text"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email Field - Uses email input type for mobile keyboard */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      inputType="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    We'll never share your email with anyone else.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field - Uses tel input type for mobile dialer */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(555) 123-4567" 
                      inputType="tel"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Select Field - Touch-optimized dropdown */}
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single-family">Single Family Home</SelectItem>
                      <SelectItem value="condo">Condominium</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="commercial">Commercial Property</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Field - Uses number input type */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Range</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. $500,000 - $750,000" 
                      inputType="text"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message Field - Touch-optimized textarea */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your property needs, timeline, and any specific requirements..."
                      className="resize-y"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include any specific requirements or questions you have.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button - Full width on mobile, auto width on desktop */}
            <div className="mobile-form-buttons">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="mobile-form-button"
              >
                Clear Form
              </Button>
              <Button 
                type="submit" 
                className="mobile-form-button"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Submitting...' : 'Send Message'}
              </Button>
            </div>

          </form>
        </Form>

        {/* Form Features List */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Mobile Optimization Features</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>✓ 44px minimum touch targets for all inputs</li>
            <li>✓ 16px font size prevents iOS zoom</li>
            <li>✓ Appropriate input types (email, tel, text)</li>
            <li>✓ Labels above inputs (not just placeholders)</li>
            <li>✓ Proper spacing between fields (16px minimum)</li>
            <li>✓ Full-width buttons on mobile, auto-width on desktop</li>
            <li>✓ Touch-friendly active states and feedback</li>
            <li>✓ Error messages with fixed height prevent layout shift</li>
            <li>✓ Stack layout on mobile, side-by-side on larger screens</li>
            <li>✓ Clear visual hierarchy and readable typography</li>
          </ul>
        </div>
      </div>
    </div>
  );
}