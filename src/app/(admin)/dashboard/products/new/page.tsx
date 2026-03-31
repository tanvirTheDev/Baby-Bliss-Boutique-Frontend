"use client";

import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SizePicker } from "@/components/ecommerce/size-picker";
import { PRODUCT_CATEGORIES, AGE_GROUPS } from "@/config/constants";

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/products"
            className="text-muted-foreground hover:text-foreground mb-1 flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Products
          </Link>
          <h1 className="font-heading text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground text-sm">
            Curate a new piece for the Baby Bliss collection.
          </p>
        </div>
        <Button className="bg-brand-gold hover:bg-brand-gold-dark text-white">
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-6">
          {/* Product Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>&#9999;&#65039;</span> Product Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-wider uppercase">
                  Product Name
                </Label>
                <Input placeholder="e.g. Organic Cotton Pointelle Knit Romper" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold tracking-wider uppercase">
                  Description
                </Label>
                <div className="flex gap-2 border-b pb-2">
                  <Button variant="ghost" size="sm" className="text-xs font-bold">
                    B
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs italic">
                    I
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    List
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Link
                  </Button>
                </div>
                <Textarea placeholder="Tell the story of this garment..." rows={4} />
              </div>
            </CardContent>
          </Card>

          {/* Editorial Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>&#128247;</span> Editorial Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
                <Upload className="text-muted-foreground mb-3 h-8 w-8" />
                <p className="text-sm font-medium">Drag and drop images here</p>
                <p className="text-muted-foreground text-xs">
                  Accepts JPG, PNG, WEBP (Max 5MB per file)
                </p>
                <Button variant="outline" className="mt-4">
                  Select Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold tracking-wider uppercase">
                    Regular Price
                  </Label>
                  <div className="relative">
                    <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                      $
                    </span>
                    <Input placeholder="0.00" className="pl-7" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Sale Price</Label>
                    <Input placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cost Price</Label>
                    <Input placeholder="0.00" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold tracking-wider uppercase">
                    SKU (Stock Keeping Unit)
                  </Label>
                  <Input placeholder="BB-ROM-001" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Stock Qty</Label>
                    <Input type="number" placeholder="100" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Low Alert</Label>
                    <Input type="number" placeholder="10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>&#10024;</span> Variants & Personalization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-semibold tracking-wider uppercase">
                  Size Availability
                </Label>
                <SizePicker selectedSize={null} onSelect={() => {}} />
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-semibold tracking-wider uppercase">
                  Color Swatches
                </Label>
                <div className="flex gap-2">
                  {["#f5e6b8", "#5fc0c0", "#f5a623", "#e91e63"].map((hex) => (
                    <div
                      key={hex}
                      className="h-8 w-8 rounded-full border"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                  <button className="text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed">
                    +
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">Draft</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visibility</span>
                <span className="font-medium">Public</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schedule</span>
                <span className="font-medium">Immediate</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">
                  Save as Draft
                </Button>
                <Button className="bg-brand-gold hover:bg-brand-gold-dark flex-1 text-white">
                  Publish Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm tracking-wider uppercase">
                Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Categories</Label>
                <div className="space-y-2">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <div key={cat.value} className="flex items-center space-x-2">
                      <Checkbox id={`cat-${cat.value}`} />
                      <label htmlFor={`cat-${cat.value}`} className="text-sm">
                        {cat.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Age Group</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_GROUPS.map((ag) => (
                      <SelectItem key={ag.value} value={ag.value}>
                        {ag.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Gender Focus</Label>
                <RadioGroup defaultValue="unisex" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unisex" id="g-unisex" />
                    <label htmlFor="g-unisex" className="text-sm">
                      Unisex
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="boy" id="g-boy" />
                    <label htmlFor="g-boy" className="text-sm">
                      Boy
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="girl" id="g-girl" />
                    <label htmlFor="g-girl" className="text-sm">
                      Girl
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Product Tags</Label>
                <Input placeholder="Organic, Spring, Knit..." />
                <div className="flex gap-1.5">
                  <Badge variant="secondary">
                    Organic <button className="ml-1">&times;</button>
                  </Badge>
                  <Badge variant="secondary">
                    Eco-Friendly <button className="ml-1">&times;</button>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm tracking-wider uppercase">
                SEO Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Meta Title</Label>
                <Input placeholder="Organic Romper | Baby Bliss" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Meta Description</Label>
                <Textarea
                  placeholder="Discover our hand-knitted organic cotton rompers..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
