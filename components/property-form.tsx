"use client";

// Formulario para publicar una propiedad nueva (con foto de portada).
import { useActionState, useState } from "react";
import { createProperty, type CreatePropertyState } from "@/app/properties/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: CreatePropertyState = {};

export function PropertyForm() {
  const [state, formAction, pending] = useActionState(createProperty, initialState);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="photo">Foto de portada</Label>
        <Input
          id="photo"
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Vista previa"
            className="aspect-video w-full max-w-sm rounded-lg object-cover"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" placeholder="Departamento 2 dormitorios en San Isidro" required />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Detalles del inmueble, estado, amenities, etc."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operation">Operación</Label>
          <Select name="operation" defaultValue="RENT">
            <SelectTrigger id="operation" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RENT">Alquiler</SelectItem>
              <SelectItem value="BUY">Venta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyType">Tipo de propiedad</Label>
          <Input id="propertyType" name="propertyType" placeholder="Casa, departamento, terreno..." required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zone">Zona</Label>
          <Input id="zone" name="zone" placeholder="San Isidro" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio (USD)</Label>
          <Input id="price" name="price" type="number" min={1} placeholder="120000" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bedrooms">Dormitorios</Label>
          <Input id="bedrooms" name="bedrooms" type="number" min={0} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Baños</Label>
          <Input id="bathrooms" name="bathrooms" type="number" min={0} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="areaM2">Superficie (m²)</Label>
          <Input id="areaM2" name="areaM2" type="number" min={0} />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Publicando..." : "Publicar propiedad"}
      </Button>
    </form>
  );
}
