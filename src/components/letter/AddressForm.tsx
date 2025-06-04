"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import states from "@/scripts/states"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
const allStates = Object.keys(states).map(
  (key) => [key, states[key]["name"].toUpperCase()]).flat();
const StateSchema = 
  z.string()
  .refine(
      (state) => allStates.includes(state.toUpperCase()),
      `Name must be one of ["${allStates.join('", "')}"]`
    );
const AddressSchema = z.object({
  name: z.string().min(1, {
    message: "Please include your name.",
  }),
  street: z.string(),
  city: z.string(),
  state: StateSchema,
  zipcode: z.string(),
});

export default function AddressForm() {
  const form = useForm<z.infer<typeof AddressSchema>>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      state: "",
      zipcode: "",
    },
  })

  function onSubmit(data: z.infer<typeof AddressSchema>) {
    const url = (
      '/repsearch?'
      + `name=${data['name']}&`  // I hate typescript
      + `street=${data['street']}&`
      + `city=${data['city']}&`
      + `state=${data['state']}&`
      + `zipcode=${data['zipcode']}`
    );  
    console.log(url)
    window.location.href = url;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main Street" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex md:flex-row flex-col">
          <FormField 
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Springfield" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="MA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zipcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="01101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
