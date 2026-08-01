"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getAdminApiHeaders } from "@/lib/admin-auth"
import {
  META_PIXEL_MAX_ID_LENGTH,
  defaultMetaPixelSettings,
  metaPixelEventOptions,
  normalizeMetaPixelSettings,
} from "@/lib/analytics/metaPixel"
import type { MetaPixelEventSettings, MetaPixelSettings } from "@/lib/types"

type MetaPixelApiResponse = {
  success: boolean
  data?: unknown
  error?: string
  message?: string
  fieldErrors?: Record<string, string>
}

type MetaPixelFormErrors = Partial<Record<"pixelId" | "form", string>>

export function MetaPixelSettings() {
  const [settings, setSettings] = useState<MetaPixelSettings>(() => normalizeMetaPixelSettings(defaultMetaPixelSettings))
  const [errors, setErrors] = useState<MetaPixelFormErrors>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true

    async function loadSettings() {
      setIsLoading(true)

      try {
        const response = await fetch("/api/admin/settings/meta-pixel", {
          headers: getAdminApiHeaders(),
          cache: "no-store",
        })
        const json = (await response.json()) as MetaPixelApiResponse

        if (!response.ok || !json.success) {
          throw new Error(json.error || "Chargement impossible")
        }

        if (isMounted) {
          setSettings(normalizeMetaPixelSettings(json.data))
          setErrors({})
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error ? error.message : "Impossible de charger les param\u00e8tres Meta Pixel"
          setErrors({ form: message })
          toast({
            title: "Erreur",
            description: message,
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadSettings()

    return () => {
      isMounted = false
    }
  }, [toast])

  const handlePixelIdChange = (value: string) => {
    if (value !== "" && !/^\d+$/.test(value)) {
      setErrors((current) => ({
        ...current,
        pixelId: "Le Pixel ID doit contenir uniquement des chiffres",
      }))
      return
    }

    if (value.length > META_PIXEL_MAX_ID_LENGTH) {
      setErrors((current) => ({
        ...current,
        pixelId: `Le Pixel ID ne doit pas d\u00e9passer ${META_PIXEL_MAX_ID_LENGTH} chiffres`,
      }))
      return
    }

    setSettings((current) => ({
      ...current,
      pixelId: value,
    }))
    setErrors((current) => ({ ...current, pixelId: undefined }))
  }

  const handleEventChange = (key: keyof MetaPixelEventSettings, checked: boolean) => {
    setSettings((current) => ({
      ...current,
      events: {
        ...current.events,
        [key]: checked,
      },
    }))
  }

  const handleEnabledChange = (checked: boolean) => {
    setSettings((current) => ({
      ...current,
      enabled: checked,
    }))
    setErrors((current) => ({ ...current, form: undefined }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = validateSettings(settings)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast({
        title: "Erreur",
        description: validationErrors.pixelId || validationErrors.form || "Param\u00e8tres invalides",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setErrors({})

    try {
      const response = await fetch("/api/admin/settings/meta-pixel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAdminApiHeaders(),
        },
        body: JSON.stringify(settings),
      })
      const json = (await response.json()) as MetaPixelApiResponse

      if (!response.ok || !json.success) {
        if (json.fieldErrors) {
          setErrors({
            pixelId: json.fieldErrors.pixelId,
            form: json.fieldErrors.form,
          })
        }
        throw new Error(json.error || "Enregistrement impossible")
      }

      setSettings(normalizeMetaPixelSettings(json.data))
      toast({
        title: "Succ\u00e8s",
        description: json.message || "Param\u00e8tres Meta Pixel enregistr\u00e9s avec succ\u00e8s",
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible d'enregistrer les param\u00e8tres Meta Pixel"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="mt-10 rounded-lg bg-white shadow-soft animate-fadeInUp">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Meta Pixel & Tracking</CardTitle>
        <CardDescription>
          Configurez le suivi des conversions provenant de vos publicit&eacute;s Facebook et Instagram.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Chargement des param&egrave;tres Meta Pixel...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.form && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {errors.form}
              </div>
            )}

            <div className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label htmlFor="meta-pixel-enabled">Activer Meta Pixel</Label>
              </div>
              <Switch id="meta-pixel-enabled" checked={settings.enabled} onCheckedChange={handleEnabledChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta-pixel-id">Meta Pixel ID</Label>
              <Input
                id="meta-pixel-id"
                inputMode="numeric"
                maxLength={META_PIXEL_MAX_ID_LENGTH}
                pattern="[0-9]*"
                placeholder="123456789012345"
                value={settings.pixelId}
                onChange={(event) => handlePixelIdChange(event.target.value)}
                aria-invalid={Boolean(errors.pixelId)}
                disabled={isSaving}
              />
              <p className={errors.pixelId ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
                {errors.pixelId || "Vous trouverez cet identifiant dans Meta Events Manager."}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">&Eacute;v&eacute;nements suivis</h3>
              </div>
              <div className={settings.enabled ? "space-y-3" : "space-y-3 opacity-60"}>
                {metaPixelEventOptions.map(({ event, key }) => (
                  <div
                    key={event}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                  >
                    <Label htmlFor={`meta-pixel-event-${key}`}>{event}</Label>
                    <Switch
                      id={`meta-pixel-event-${key}`}
                      checked={settings.events[key]}
                      disabled={!settings.enabled || isSaving}
                      onCheckedChange={(checked) => handleEventChange(key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              <Save className="h-4 w-4" />
              {isSaving ? "Enregistrement..." : "Enregistrer les param\u00e8tres Meta Pixel"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

function validateSettings(settings: MetaPixelSettings): MetaPixelFormErrors {
  if (settings.pixelId && !/^\d+$/.test(settings.pixelId)) {
    return { pixelId: "Le Pixel ID doit contenir uniquement des chiffres" }
  }

  if (settings.pixelId.length > META_PIXEL_MAX_ID_LENGTH) {
    return { pixelId: `Le Pixel ID ne doit pas d\u00e9passer ${META_PIXEL_MAX_ID_LENGTH} chiffres` }
  }

  if (settings.enabled && settings.pixelId.length === 0) {
    return { pixelId: "Le Meta Pixel ID est obligatoire lorsque le Pixel est activ\u00e9" }
  }

  return {}
}
