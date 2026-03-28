"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { HelpArticle, HelpCategory, CreateArticleDto } from "@/types/article";
import { RichTextEditor } from "@/components/blogs/rich-text-editor";
import { Loader2 } from "lucide-react";

const articleSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.number().min(1, "Category is required"),
    content: z.string().min(1, "Content is required"),
    published: z.boolean(),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleFormProps {
    initialData?: HelpArticle;
    categories: HelpCategory[];
    onSubmit: (data: ArticleFormValues) => void;
    isLoading: boolean;
}

export function ArticleForm({ initialData, categories, onSubmit, isLoading }: ArticleFormProps) {
    const form = useForm<ArticleFormValues>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            categoryId: initialData?.categoryId || 0,
            content: initialData?.content || "",
            published: initialData?.published ?? true,
        },
    });

    const onFormSubmit = (values: ArticleFormValues) => {
        onSubmit(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
                <FormField<ArticleFormValues>
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Article Title</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="e.g. How to reset your password" 
                                    {...field} 
                                    value={field.value as string} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField<ArticleFormValues>
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select 
                                    onValueChange={(val) => field.onChange(parseInt(val))} 
                                    defaultValue={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField<ArticleFormValues>
                        control={form.control}
                        name="published"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Published</FormLabel>
                                    <p className="text-xs text-muted-foreground">Make this article visible to users.</p>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value as boolean}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField<ArticleFormValues>
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Briefly describe what this article covers..." 
                                    className="resize-none"
                                    {...field} 
                                    value={field.value as string}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField<ArticleFormValues>
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Article Content</FormLabel>
                            <FormControl>
                                <RichTextEditor
                                    value={field.value as string}
                                    onChange={field.onChange}
                                    placeholder="Start writing the help article content..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3">
                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto px-8">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Article" : "Create Article"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
