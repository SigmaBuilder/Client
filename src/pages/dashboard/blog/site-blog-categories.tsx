import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { api } from "@/lib/api";
import { useWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSetSitePageHeader } from "@/components/site/SitePageHeader";
import { useTranslation } from "react-i18next";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function SiteBlogCategoriesPage() {
  const { currentSite } = useWorkspace();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const { t } = useTranslation();

  const fetchCategories = async () => {
    if (!currentSite?.id) return;
    setLoading(true);
    try {
      const res = await api.getBlogCategories<any>(currentSite.id);
      if (res.success && res.data?.blogCategories) {
        setCategories(res.data.blogCategories);
      }
    } catch (err) {
      toast.error(t("siteBlogCategories.toastLoadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSite?.id) {
      fetchCategories();
    }
  }, [currentSite?.id]);

  const handleOpenDialog = useCallback((category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, slug: category.slug });
    } else {
      setEditingId(null);
      setFormData({ name: "", slug: "" });
    }
    setIsOpen(true);
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentSite?.id) return;
    try {
      if (editingId) {
        await api.updateBlogCategory(currentSite.id, editingId, formData);
        toast.success(t("siteBlogCategories.toastUpdated"));
      } else {
        await api.createBlogCategory(currentSite.id, formData);
        toast.success(t("siteBlogCategories.toastCreated"));
      }
      setIsOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(t("siteBlogCategories.toastSaveError"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentSite?.id) return;
    if (!confirm(t("siteBlogCategories.confirmDelete"))) return;
    try {
      await api.deleteBlogCategory(currentSite.id, id);
      toast.success(t("siteBlogCategories.toastDeleteSuccess"));
      fetchCategories();
    } catch (err) {
      toast.error(t("siteBlogCategories.toastDeleteError"));
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !editingId ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") : prev.slug,
    }));
  };

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) =>
      [category.name, category.slug].some((value) => value.toLowerCase().includes(query)),
    );
  }, [categories, search]);

  const headerState = useMemo(() => ({
    breadcrumbs: [
      { label: t("siteBlogCategories.breadcrumbBlog") },
      { label: t("siteBlogCategories.breadcrumbCategories") },
    ],
    search: {
      value: search,
      onChange: setSearch,
      placeholder: t("siteBlogCategories.searchPlaceholder"),
    },
    actions: (
      <>
        <Badge variant="secondary">{t("siteBlogCategories.countCategories", { count: categories.length })}</Badge>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          <Plus data-icon="inline-start" />
          {t("siteBlogCategories.newCategoryBtn")}
        </Button>
      </>
    ),
  }), [categories.length, handleOpenDialog, search, t]);

  useSetSitePageHeader(currentSite ? headerState : null);

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <Card className="mx-auto w-full max-w-5xl">
        <CardHeader>
          <CardTitle>{t("siteBlogCategories.pageTitle")}</CardTitle>
          <CardDescription>{t("siteBlogCategories.pageDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
              <Tag className="size-12 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <p className="font-medium text-foreground">
                  {categories.length === 0 ? t("siteBlogCategories.emptyTitle") : t("siteBlogCategories.emptyTitleSearch")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {categories.length === 0 ? t("siteBlogCategories.emptyDesc") : t("siteBlogCategories.emptyDescSearch")}
                </p>
              </div>
              {categories.length === 0 && (
                <Button variant="outline" onClick={() => handleOpenDialog()}>
                  {t("siteBlogCategories.createBtn")}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("siteBlogCategories.colName")}</TableHead>
                  <TableHead>{t("siteBlogCategories.colSlug")}</TableHead>
                  <TableHead>{t("siteBlogCategories.colDate")}</TableHead>
                  <TableHead className="text-right">{t("siteBlogCategories.colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(category.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleOpenDialog(category)} aria-label={`Editar ${category.name}`}>
                          <Edit2 />
                        </Button>
                        <Button variant="destructive" size="icon-sm" onClick={() => handleDelete(category.id)} aria-label={`Eliminar ${category.name}`}>
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t("siteBlogCategories.dialogEditTitle") : t("siteBlogCategories.dialogNewTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">{t("siteBlogCategories.nameLabel")}</FieldLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder={t("siteBlogCategories.namePlaceholder")}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="slug">{t("siteBlogCategories.slugLabel")}</FieldLabel>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder={t("siteBlogCategories.slugPlaceholder")}
                  required
                />
              </Field>
            </FieldGroup>
            <div className="flex justify-end">
              <Button type="submit">{t("siteBlogCategories.saveBtn")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
