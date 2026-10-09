"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { SelectField } from "@/components/ui/Field";
import Tabs, { TabPanel } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { ROLE_OPTIONS } from "@/features/auth/roles";
import { useSession } from "@/features/auth/session";
import { getErrorMessage } from "@/lib/apiClient";
import { deletePost, fetchPosts, postsQueryKey, toggleLike } from "./api";
import { addFavourite, removeFavourite, useFavourites } from "./favourites";
import { sortPinned, usePinnedPosts } from "./pins";
import PostCard, { PostCardSkeleton, postGridClass } from "./PostCard";
import PostComposer from "./PostComposer";
import { filterPosts } from "./search";

const TABS = [
  { value: "feed", label: "Ana Sayfa" },
  { value: "mine", label: "Postların" },
];
const ROLE_FILTER = [{ value: "", label: "Tümü" }, ...ROLE_OPTIONS];

export default function Feed() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const userId = useSession()?.kullanici?.id;
  const [tab, setTab] = useState("feed");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const favourites = useFavourites();
  const [pinnedIds, togglePin] = usePinnedPosts(userId);
  const { data: posts = [], isPending, isError, error, refetch } = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPosts,
  });

  const likeMutation = useMutation({
    mutationFn: (post) => toggleLike(post._id),
    onSuccess: (result, post) => {
      queryClient.setQueryData(postsQueryKey, (current = []) =>
        current.map((item) => (item._id === post._id ? { ...item, ...result } : item))
      );
    },
    onError: (likeError) => toast.error(getErrorMessage(likeError, "Beğeni kaydedilemedi.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (post) => deletePost(post._id),
    onSuccess: (_, post) => {
      queryClient.setQueryData(postsQueryKey, (current = []) =>
        current.filter((item) => item._id !== post._id)
      );
      removeFavourite(post._id);
      setPostToDelete(null);
      toast.success("Gönderi silindi");
    },
  });

  const closeDeleteDialog = () => {
    if (deleteMutation.isPending) return;
    setPostToDelete(null);
    deleteMutation.reset();
  };

  const savedIds = new Set(favourites.map((item) => item._id));
  const isMine = tab === "mine";
  const ownPosts = posts.filter((post) => post.benim);
  const visiblePosts = isMine
    ? sortPinned(filterPosts(ownPosts, { query }), pinnedIds)
    : filterPosts(posts, { query, role });
  const hasFilters = query.trim() !== "" || (!isMine && role !== "");

  const actionsFor = (post) => {
    if (isMine) {
      return { onTogglePin: (item) => togglePin(item._id), onDelete: setPostToDelete };
    }
    if (post.benim) return {};
    return {
      onToggleLike: likeMutation.mutate,
      onToggleSave: (item) =>
        savedIds.has(item._id) ? removeFavourite(item._id) : addFavourite(item),
    };
  };

  const renderList = () => {
    if (isPending) {
      return (
        <div className={postGridClass} role="status" aria-label="Gönderiler yükleniyor">
          {Array.from({ length: 4 }, (_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <EmptyState
          icon={ExclamationTriangleIcon}
          title="Gönderiler yüklenemedi"
          description={getErrorMessage(error)}
          action={
            <Button variant="secondary" onClick={() => refetch()}>
              Tekrar dene
            </Button>
          }
        />
      );
    }
    if (visiblePosts.length === 0) {
      if (hasFilters) {
        return (
          <EmptyState
            icon={MagnifyingGlassIcon}
            title="Sonuç bulunamadı"
            description="Arama veya filtreyi değiştirip tekrar dene."
          />
        );
      }
      return isMine ? (
        <EmptyState
          icon={PencilSquareIcon}
          title="Henüz gönderin yok"
          description="Antrenmanını veya beslenme notunu paylaşarak başla."
          action={<Button onClick={() => setComposerOpen(true)}>İlk gönderini paylaş</Button>}
        />
      ) : (
        <EmptyState
          icon={NewspaperIcon}
          title="Akış henüz boş"
          description="İlk gönderiyi sen paylaşabilirsin."
        />
      );
    }
    return (
      <div className={postGridClass}>
        {visiblePosts.map((post, index) => (
          <PostCard
            key={post._id}
            post={post}
            priority={index < 2}
            saved={savedIds.has(post._id)}
            pinned={isMine && pinnedIds.includes(post._id)}
            likePending={likeMutation.isPending && likeMutation.variables?._id === post._id}
            actions={actionsFor(post)}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Akış</h1>
        <Tabs id="feed" label="Gönderi görünümü" tabs={TABS} value={tab} onChange={setTab} className="flex sm:inline-flex" />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="post-search" className="mb-1.5 block text-sm font-medium">
            Gönderilerde ara
          </label>
          <div className="relative">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
            />
            <input
              id="post-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Başlık, açıklama veya üye adı"
              className="field-control pl-10"
            />
          </div>
        </div>
        {isMine ? (
          <Button onClick={() => setComposerOpen(true)} className="shrink-0">
            <PlusIcon aria-hidden="true" className="size-5" />
            Yeni gönderi
          </Button>
        ) : (
          <SelectField
            label="Rol"
            options={ROLE_FILTER}
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="sm:w-44"
          />
        )}
      </div>

      <TabPanel group="feed" value={tab} className="mt-6">
        {renderList()}
      </TabPanel>

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
      <ConfirmDialog
        open={Boolean(postToDelete)}
        onClose={closeDeleteDialog}
        onConfirm={() => deleteMutation.mutate(postToDelete)}
        title="Gönderi silinsin mi?"
        description={
          postToDelete ? `“${postToDelete.baslik}” kalıcı olarak silinecek. Bu işlem geri alınamaz.` : undefined
        }
        confirmLabel="Sil"
        tone="danger"
        pending={deleteMutation.isPending}
        error={deleteMutation.isError ? getErrorMessage(deleteMutation.error, "Gönderi silinemedi.") : undefined}
      />
    </div>
  );
}
