"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPostAction, updatePostAction } from "@/actions/post";
import RichTextEditor from "@/components/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { toast } from "sonner";

const PostSchema = z.object({
  title: z.string().min(1, "Title is required."),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens."
    ),
  content: z.string().min(1, "Content is required."),
  published: z.boolean(),
});

type PostFormData = z.infer<typeof PostSchema>;

interface PostFormProps {
  post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    published: boolean;
  } | null;
  authorUsername: string;
}

export default function PostForm({ post, authorUsername }: PostFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSlugModifiedByUser, setIsSlugModifiedByUser] = useState(!!post);


  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    setError,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      published: post ? post.published : true,
    },
  });

  const slugValue = watch("slug");

  // Slugify helper: strip special chars and replace spaces/multiple dashes
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9-\s]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val, { shouldValidate: true });

    if (!isSlugModifiedByUser) {
      setValue("slug", slugify(val), { shouldValidate: true });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("slug", val, { shouldValidate: true });
    setIsSlugModifiedByUser(true);
  };

  const onSubmit = async (data: PostFormData) => {
    setIsPending(true);
    setFormError(null);

    try {
      let result;
      if (post) {
        // Edit Mode
        result = await updatePostAction(post.id, data);
      } else {
        // Create Mode
        result = await createPostAction(data);
      }

      if (result.success) {
        toast.success(post ? "Story updated successfully." : "Story created successfully.");
        router.push("/admin");
        router.refresh();
      } else if (result.errors) {
        // Set Zod field errors from server
        Object.entries(result.errors).forEach(([field, msg]) => {
          setError(field as keyof PostFormData, { type: "server", message: msg });
        });
        toast.error("Please fix the validation errors below.");
      } else {
        const errMsg = result.error || "An unexpected error occurred.";
        setFormError(errMsg);
        toast.error(errMsg);
      }
    } catch (err) {
      console.error(err);
      const errMsg = "An unexpected error occurred. Please try again.";
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {formError && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm font-medium text-destructive">
          {formError}
        </div>
      )}

      {/* Title Field */}
      <Field data-invalid={errors.title ? "true" : undefined}>
        <FieldLabel htmlFor="title">Post Title</FieldLabel>
        <FieldContent>
          <Input
            id="title"
            type="text"
            placeholder="e.g. My First Blog Post"
            disabled={isPending}
            {...register("title")}
            onChange={handleTitleChange}
          />
          <FieldError>{errors.title?.message}</FieldError>
        </FieldContent>
      </Field>

      {/* Slug Field */}
      <Field data-invalid={errors.slug ? "true" : undefined}>
        <FieldLabel htmlFor="slug">URL Slug</FieldLabel>
        <FieldContent>
          <Input
            id="slug"
            type="text"
            placeholder="e.g. my-first-blog-post"
            disabled={isPending}
            {...register("slug")}
            onChange={handleSlugChange}
          />
          <div className="text-[11px] text-zinc-500 mt-1.5 font-mono break-all leading-normal">
            Resulting URL: <span className="text-primary font-semibold">/{authorUsername}/{slugValue || "slug"}</span>
          </div>
          <FieldError>{errors.slug?.message}</FieldError>
        </FieldContent>
      </Field>

      {/* Content Field with Tiptap WYSIWYG Editor */}
      <Field data-invalid={errors.content ? "true" : undefined}>
        <FieldLabel htmlFor="content">Post Content</FieldLabel>
        <FieldContent>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
          <FieldError>{errors.content?.message}</FieldError>
        </FieldContent>
      </Field>

      {/* Published Toggle Checkbox */}
      <div className="flex items-center space-x-2 border-t border-zinc-150 pt-6 dark:border-zinc-800">
        <Controller
          name="published"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="published"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="published"
            className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            Publish immediately
          </Label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Unchecking this will save the post as a draft, hidden from the public feeds.
          </p>
        </div>
      </div>

      {/* Form Submission Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-800">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.push("/admin")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : post ? "Update Post" : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
