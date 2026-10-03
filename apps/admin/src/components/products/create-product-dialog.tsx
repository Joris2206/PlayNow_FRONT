"use client";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  LoaderCircle,
  Plus,
} from "lucide-react";

import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-products";
import { extractDrfFieldError, getApiErrorMessage } from "@/lib/api-error";
import { HttpError } from "@/lib/http";

import CreateCategoryDialog from "@/components/categories/create-category-dialog";
import ProductCategorySelectorDialog from "@/components/products/product-category-selector-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import type { Category } from "@/types/category";
import type {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from "@/types/product";

type CreateProductDialogProps = {
  businessPublicId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

type EditProductDialogProps = {
  businessPublicId?: string;
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ProductDialogProps = {
  businessPublicId?: string;
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void;
};

type ProductFormState = {
  categoryPublicId: string;
  title: string;
  description: string;
  imageUrl: string;
  basePrice: string;
  baseCost: string;
  stock: string;
  isVisible: boolean;
};

type ValidatedField =
  | "categoryPublicId"
  | "title"
  | "imageUrl"
  | "basePrice"
  | "baseCost"
  | "stock";

function getInitialFormState(
  product?: Product
): ProductFormState {
  return {
    categoryPublicId:
      product?.category_public_id ?? "",
    title: product?.title ?? "",
    description: product?.description ?? "",
    imageUrl: product?.image_url ?? "",
    basePrice: product?.base_price ?? "",
    baseCost: product?.base_cost ?? "",
    stock: String(product?.stock ?? 0),
    isVisible: product?.is_visible ?? true,
  };
}

function getProductForBusiness(
  product: Product | undefined,
  businessPublicId: string | undefined
) {
  return product?.business_public_id === businessPublicId
    ? product
    : undefined;
}

function getApiFieldError(
  error: unknown,
  field: string
) {
  return error instanceof HttpError
    ? extractDrfFieldError(error.data, field)
    : null;
}

function isValidUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function ProductDialog({
  businessPublicId,
  product,
  open,
  onOpenChange,
  onCompleted,
}: ProductDialogProps) {
  const initialProduct = getProductForBusiness(
    product,
    businessPublicId
  );
  const [form, setForm] = useState<ProductFormState>(
    getInitialFormState(initialProduct)
  );
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] =
    useState(false);
  const [categorySelectorOpen, setCategorySelectorOpen] =
    useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<
      Pick<
        Category,
        "public_id" | "business_public_id" | "name"
      > | null
    >(
      initialProduct
        ? {
            public_id: initialProduct.category_public_id,
            business_public_id:
              initialProduct.business_public_id,
            name: initialProduct.category_name,
          }
        : null
    );
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<ValidatedField, boolean>>
  >({});

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isEditing = Boolean(product);
  const isPending = isEditing
    ? updateProduct.isPending
    : createProduct.isPending;
  const mutationError = isEditing
    ? updateProduct.error
    : createProduct.error;

  useEffect(() => {
    if (!open) {
      return;
    }

    const currentProduct = getProductForBusiness(
      product,
      businessPublicId
    );

    setForm(getInitialFormState(currentProduct));
    setSelectedCategory(
      currentProduct
        ? {
            public_id: currentProduct.category_public_id,
            business_public_id:
              currentProduct.business_public_id,
            name: currentProduct.category_name,
          }
        : null
    );
    setTouchedFields({});
    createProduct.reset();
    updateProduct.reset();
  }, [open, product, businessPublicId]);

  const title = form.title.trim();
  const selectedCategoryForBusiness =
    selectedCategory?.business_public_id ===
    businessPublicId
      ? selectedCategory
      : null;
  const hasCategoryForBusiness = Boolean(
    selectedCategoryForBusiness &&
      selectedCategoryForBusiness.public_id ===
        form.categoryPublicId
  );
  const basePrice = form.basePrice.trim();
  const baseCost = form.baseCost.trim();
  const imageUrl = form.imageUrl.trim();
  const basePriceNumber = Number(basePrice);
  const baseCostNumber = Number(baseCost);
  const stock = Number(form.stock);
  const hasValidBasePrice =
    basePrice.length > 0 &&
    Number.isFinite(basePriceNumber) &&
    basePriceNumber >= 0;
  const hasValidBaseCost =
    baseCost.length > 0 &&
    Number.isFinite(baseCostNumber) &&
    baseCostNumber >= 0;
  const hasValidStock =
    form.stock.trim().length > 0 &&
    Number.isInteger(stock) &&
    stock >= 0;
  const hasValidImageUrl = isValidUrl(imageUrl);
  const canSubmit = Boolean(
    businessPublicId &&
    hasCategoryForBusiness &&
    title &&
    hasValidBasePrice &&
    hasValidBaseCost &&
    hasValidImageUrl &&
    (isEditing || hasValidStock)
  );

  const localErrors: Record<ValidatedField, string | null> = {
    categoryPublicId: hasCategoryForBusiness
      ? null
      : "Selecciona una categoría.",
    title: title ? null : "Ingresa un título.",
    imageUrl: hasValidImageUrl
      ? null
      : "Ingresa una URL válida.",
    basePrice: hasValidBasePrice
      ? null
      : "Ingresa un precio válido.",
    baseCost: hasValidBaseCost
      ? null
      : "Ingresa un costo válido.",
    stock: isEditing || hasValidStock
      ? null
      : "Ingresa un stock válido.",
  };

  const apiErrors = {
    businessPublicId: getApiFieldError(
      mutationError,
      "business_public_id"
    ),
    categoryPublicId: getApiFieldError(
      mutationError,
      "category_public_id"
    ),
    title: getApiFieldError(
      mutationError,
      "title"
    ),
    description: getApiFieldError(
      mutationError,
      "description"
    ),
    imageUrl: getApiFieldError(
      mutationError,
      "image_url"
    ),
    basePrice: getApiFieldError(
      mutationError,
      "base_price"
    ),
    baseCost: getApiFieldError(
      mutationError,
      "base_cost"
    ),
    stock: getApiFieldError(
      mutationError,
      "stock"
    ),
  };

  function visibleFieldError(field: ValidatedField) {
    return apiErrors[field] ??
      (touchedFields[field]
        ? localErrors[field]
        : null);
  }

  const categoryError = visibleFieldError(
    "categoryPublicId"
  );
  const titleError = visibleFieldError("title");
  const imageUrlError = visibleFieldError("imageUrl");
  const basePriceError = visibleFieldError("basePrice");
  const baseCostError = visibleFieldError("baseCost");
  const stockError = isEditing
    ? null
    : visibleFieldError("stock");

  const submitGuidance = !businessPublicId
    ? "No hay un negocio activo para guardar el producto."
    : !hasCategoryForBusiness
      ? "Selecciona una categoría para continuar."
      : !title || !basePrice || !baseCost
        ? "Completa los campos requeridos para guardar el producto."
        : !hasValidBasePrice ||
            !hasValidBaseCost ||
            (!isEditing && !hasValidStock) ||
            !hasValidImageUrl
          ? "Revisa los campos marcados antes de continuar."
          : null;

  function updateForm<K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K]
  ) {
    if (createProduct.isError || updateProduct.isError) {
      createProduct.reset();
      updateProduct.reset();
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function markTouched(field: ValidatedField) {
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }));
  }

  function resetForm() {
    setForm(getInitialFormState(product));
    setSelectedCategory(null);
    setTouchedFields({});
    createProduct.reset();
    updateProduct.reset();
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isPending) {
      return;
    }

    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  function handleCategoryCreated(category: Category) {
    setSelectedCategory(category);
    updateForm("categoryPublicId", category.public_id);
    markTouched("categoryPublicId");
  }

  function handleCategorySelect(category: Category) {
    setSelectedCategory(category);
    updateForm("categoryPublicId", category.public_id);
    markTouched("categoryPublicId");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !businessPublicId ||
      !canSubmit ||
      isPending
    ) {
      return;
    }

    try {
      const updateData: UpdateProductRequest = {
        category_public_id: form.categoryPublicId,
        title,
        description: form.description.trim(),
        image_url: imageUrl,
        base_price: basePrice,
        base_cost: baseCost,
        is_visible: form.isVisible,
      };

      if (product) {
        await updateProduct.mutateAsync({
          publicId: product.public_id,
          businessPublicId,
          data: updateData,
        });
      } else {
        const createData: CreateProductRequest = {
          business_public_id: businessPublicId,
          category_public_id: form.categoryPublicId,
          title,
          description: form.description.trim(),
          image_url: imageUrl,
          base_price: basePrice,
          base_cost: baseCost,
          stock,
          is_visible: form.isVisible,
        };

        await createProduct.mutateAsync(createData);
      }

      resetForm();
      onCompleted?.();
      onOpenChange(false);
    } catch {
      // React Query exposes the request error below.
    }
  }

  const hasApiFieldErrors = Object.values(apiErrors).some(
    Boolean
  );
  const nonFieldError =
    getApiFieldError(
      mutationError,
      "non_field_errors"
    ) ?? apiErrors.businessPublicId;
  const errorMessage = nonFieldError ??
    (mutationError && !hasApiFieldErrors
      ? getApiErrorMessage(
          mutationError,
          "No fue posible guardar el producto. Intenta nuevamente."
        )
      : null);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing
                ? "Editar producto"
                : "Nuevo producto"}
            </DialogTitle>

            <DialogDescription className="text-zinc-500">
              {isEditing
                ? "Actualiza la información del producto."
                : "Agrega un producto al catálogo de tu negocio."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-300">
                  Categoría
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCreateCategoryDialogOpen(true)
                  }
                  disabled={!businessPublicId || isPending}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Plus className="h-4 w-4" />
                  Nueva categoría
                </Button>
              </div>

              <div
                id="product-category"
                aria-invalid={Boolean(categoryError)}
                aria-describedby={
                  categoryError
                    ? "product-category-error"
                    : undefined
                }
                className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  categoryError
                    ? "border-red-500/50 bg-red-500/5"
                    : selectedCategoryForBusiness
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-dashed border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {selectedCategoryForBusiness
                      ? "Categoría seleccionada"
                      : "Sin categoría seleccionada"}
                  </p>
                  {selectedCategoryForBusiness && (
                    <p className="mt-1 truncate text-sm font-medium text-white">
                      {selectedCategoryForBusiness.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button
                    type="button"
                    variant="inverseOutline"
                    size={
                      selectedCategoryForBusiness
                        ? "sm"
                        : "default"
                    }
                    onClick={() => {
                      markTouched("categoryPublicId");
                      setCategorySelectorOpen(true);
                    }}
                    disabled={!businessPublicId || isPending}
                  >
                    {selectedCategoryForBusiness
                      ? "Cambiar"
                      : "Seleccionar categoría"}
                  </Button>

                  {selectedCategoryForBusiness && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(null);
                        updateForm("categoryPublicId", "");
                        markTouched("categoryPublicId");
                      }}
                      disabled={isPending}
                      aria-label={`Quitar la categoría ${selectedCategoryForBusiness.name} del producto`}
                      className="text-zinc-400 hover:bg-white/5 hover:text-white"
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>

              {categoryError && (
                <p
                  id="product-category-error"
                  className="text-xs text-red-400"
                >
                  {categoryError}
                </p>
              )}

            </div>

            <div className="space-y-2">
              <label
                htmlFor="product-title"
                className="text-sm font-medium text-zinc-300"
              >
                Título
              </label>

              <Input
                id="product-title"
                value={form.title}
                onChange={(event) =>
                  updateForm("title", event.target.value)
                }
                onBlur={() => markTouched("title")}
                required
                aria-invalid={Boolean(titleError)}
                aria-describedby={
                  titleError
                    ? "product-title-error"
                    : undefined
                }
                disabled={isPending}
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
              />

              {titleError && (
                <p
                  id="product-title-error"
                  className="text-xs text-red-400"
                >
                  {titleError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="product-description"
                className="text-sm font-medium text-zinc-300"
              >
                Descripción (opcional)
              </label>

              <textarea
                id="product-description"
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                disabled={isPending}
                aria-invalid={Boolean(
                  apiErrors.description
                )}
                aria-describedby={
                  apiErrors.description
                    ? "product-description-error"
                    : undefined
                }
                rows={3}
                className="w-full resize-y rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-3 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              />

              {apiErrors.description && (
                <p
                  id="product-description-error"
                  className="text-xs text-red-400"
                >
                  {apiErrors.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="product-image-url"
                className="text-sm font-medium text-zinc-300"
              >
                URL de imagen (opcional)
              </label>

              <Input
                id="product-image-url"
                type="url"
                value={form.imageUrl}
                onChange={(event) =>
                  updateForm("imageUrl", event.target.value)
                }
                onBlur={() => markTouched("imageUrl")}
                disabled={isPending}
                aria-invalid={Boolean(imageUrlError)}
                aria-describedby={
                  imageUrlError
                    ? "product-image-url-error"
                    : undefined
                }
                placeholder="https://..."
                className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
              />

              {imageUrlError && (
                <p
                  id="product-image-url-error"
                  className="text-xs text-red-400"
                >
                  {imageUrlError}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="product-base-price"
                  className="text-sm font-medium text-zinc-300"
                >
                  Precio base
                </label>

                <Input
                  id="product-base-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(event) =>
                    updateForm("basePrice", event.target.value)
                  }
                  onBlur={() => markTouched("basePrice")}
                  required
                  aria-invalid={Boolean(basePriceError)}
                  aria-describedby={
                    basePriceError
                      ? "product-base-price-error"
                      : undefined
                  }
                  disabled={isPending}
                  className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
                />

                {basePriceError && (
                  <p
                    id="product-base-price-error"
                    className="text-xs text-red-400"
                  >
                    {basePriceError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="product-base-cost"
                  className="text-sm font-medium text-zinc-300"
                >
                  Costo base
                </label>

                <Input
                  id="product-base-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.baseCost}
                  onChange={(event) =>
                    updateForm("baseCost", event.target.value)
                  }
                  onBlur={() => markTouched("baseCost")}
                  required
                  aria-invalid={Boolean(baseCostError)}
                  aria-describedby={
                    baseCostError
                      ? "product-base-cost-error"
                      : undefined
                  }
                  disabled={isPending}
                  className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
                />

                {baseCostError && (
                  <p
                    id="product-base-cost-error"
                    className="text-xs text-red-400"
                  >
                    {baseCostError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
              <div className="space-y-2">
                {product ? (
                  <>
                    <span className="text-sm font-medium text-zinc-300">
                      Stock actual
                    </span>
                    <div className="flex h-11 items-center rounded-md border border-white/10 bg-white/[0.025] px-3 text-sm text-zinc-300">
                      {product.stock}
                    </div>
                  </>
                ) : (
                  <>
                    <label
                      htmlFor="product-stock"
                      className="text-sm font-medium text-zinc-300"
                    >
                      Stock inicial
                    </label>

                    <Input
                      id="product-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={(event) =>
                        updateForm("stock", event.target.value)
                      }
                      onBlur={() => markTouched("stock")}
                      required
                      aria-invalid={Boolean(stockError)}
                      aria-describedby={
                        stockError
                          ? "product-stock-error"
                          : undefined
                      }
                      disabled={isPending}
                      className="h-11 border-white/10 bg-white/5 text-white placeholder:text-zinc-600"
                    />

                    {stockError && (
                      <p
                        id="product-stock-error"
                        className="text-xs text-red-400"
                      >
                        {stockError}
                      </p>
                    )}
                  </>
                )}
              </div>

              <label className="flex h-11 items-center gap-3 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(event) =>
                    updateForm("isVisible", event.target.checked)
                  }
                  disabled={isPending}
                  className="h-4 w-4 accent-red-500"
                />
                Visible en el catálogo
              </label>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {errorMessage}
              </div>
            )}

            <div className="space-y-3">
              {!isPending && submitGuidance && (
                <p
                  className="text-sm text-zinc-400"
                  aria-live="polite"
                >
                  {submitGuidance}
                </p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    handleOpenChange(false)
                  }
                  disabled={isPending}
                  className="border-white/10 bg-transparent text-white hover:bg-white/5"
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  disabled={!canSubmit || isPending}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  {isPending ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      {isEditing
                        ? "Guardando..."
                        : "Creando..."}
                    </>
                  ) : isEditing ? (
                    "Guardar cambios"
                  ) : (
                    "Crear producto"
                  )}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ProductCategorySelectorDialog
        businessPublicId={businessPublicId}
        selectedCategory={selectedCategoryForBusiness}
        open={categorySelectorOpen}
        disabled={isPending}
        onOpenChange={setCategorySelectorOpen}
        onSelect={handleCategorySelect}
      />

      <CreateCategoryDialog
        businessPublicId={businessPublicId}
        open={createCategoryDialogOpen}
        onOpenChange={setCreateCategoryDialogOpen}
        onCreated={handleCategoryCreated}
      />
    </>
  );
}

export default function CreateProductDialog(
  props: CreateProductDialogProps
) {
  return (
    <ProductDialog
      businessPublicId={props.businessPublicId}
      open={props.open}
      onOpenChange={props.onOpenChange}
      onCompleted={props.onCreated}
    />
  );
}

export function EditProductDialog({
  businessPublicId,
  product,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  if (!product) {
    return null;
  }

  return (
    <ProductDialog
      businessPublicId={businessPublicId}
      product={product}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
