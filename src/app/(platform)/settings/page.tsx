'use client'

import { Card, CardHeader, CardContent, Button, Text } from '@music-vine/cadence/ui'
import { Form } from '@/components/forms/Form'
import { FormInput } from '@/components/forms/FormInput'
import { z } from 'zod'
import { useState } from 'react'

// Validation schema for profile settings
const profileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
})

type ProfileFormData = z.infer<typeof profileSchema>

/**
 * Settings page demonstrating form validation with Cadence components.
 * Uses custom Form wrapper (React Hook Form + Zod) with Cadence Input components.
 */
export default function SettingsPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (data: ProfileFormData) => {
    console.log('Form submitted:', data)
    setSubmitted(true)
    // In real implementation, this would call API
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Text className="mt-1 text-muted-foreground">Update your profile settings</Text>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <h2 className="text-xl font-semibold">Profile Information</h2>
        </CardHeader>
        <CardContent>
          {submitted && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              Settings saved successfully
            </div>
          )}

          <Form
            schema={profileSchema}
            defaultValues={{ name: '', email: '' }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <FormInput
              name="name"
              label="Display Name"
              placeholder="Your name"
              autoComplete="name"
            />

            <FormInput
              name="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />

            <div className="pt-2">
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </div>
          </Form>

          <Text className="mt-4 text-sm text-muted-foreground">
            Try leaving fields empty or entering invalid data to see validation in action.
            Validation fires on blur (when you leave a field).
          </Text>
        </CardContent>
      </Card>
    </div>
  )
}
