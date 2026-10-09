import Image from "next/image";
import {
  BookmarkIcon,
  BookmarkSlashIcon,
  HeartIcon,
  MapPinIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon as HeartSolidIcon,
  MapPinIcon as MapPinSolidIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
import Avatar from "@/components/ui/Avatar";
import { API_URL } from "@/lib/apiClient";
import { cn } from "@/lib/cn";
import { formatNumber, formatRelativeDate } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

function ActionButton({ icon: Icon, label, pressed, active, tone, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={children ? undefined : label}
      title={children ? undefined : label}
      aria-pressed={pressed}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-subtle disabled:opacity-60",
        tone === "danger" ? "text-ink-muted hover:text-danger-ink" : "text-ink-muted hover:text-ink",
        active && "text-brand-ink hover:text-brand-ink"
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      {children}
    </button>
  );
}

/**
 * `actions` decides which controls the card offers:
 * onToggleLike, onToggleSave, onRemoveSaved, onTogglePin, onDelete.
 */
export default function PostCard({ post, saved, pinned, likePending, actions = {}, priority }) {
  const image = mediaUrl(post.resim, API_URL);
  const author = post.yazar?.adSoyad || "Actora üyesi";
  const hasActions = Object.values(actions).some(Boolean);

  return (
    <article className="card flex min-w-0 flex-col overflow-hidden">
      {image && (
        <div className="relative aspect-[4/3] bg-subtle">
          <Image
            src={image}
            alt={post.baslik ? `${post.baslik} gönderisinin görseli` : "Gönderi görseli"}
            fill
            priority={priority}
            sizes="(min-width: 1536px) 28vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Avatar name={author} src={post.yazar?.resim} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{post.benim ? "Sen" : author}</p>
            <p className="truncate text-xs text-ink-muted">
              {[post.rol, post.createdAt && formatRelativeDate(post.createdAt)]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          {pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-1 text-xs font-medium text-brand-ink">
              <MapPinSolidIcon aria-hidden="true" className="size-3.5" />
              Sabit
            </span>
          )}
        </div>

        <h3 className="mt-4 break-words text-base font-semibold">{post.baslik}</h3>
        <p className="mt-1.5 whitespace-pre-line break-words text-sm text-ink-muted">
          {post.aciklama}
        </p>

        {post.kacAdim && (
          <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success-ink">
            <TrophyIcon aria-hidden="true" className="size-4" />
            Hedef tamamlandı · günde {formatNumber(Number(post.kacAdim))} adım
          </p>
        )}

        {hasActions && (
          <div className="-mx-2 -mb-2 mt-auto flex flex-wrap items-center gap-1 pt-3">
            {actions.onToggleLike && (
              <ActionButton
                icon={post.begendi ? HeartSolidIcon : HeartIcon}
                pressed={Boolean(post.begendi)}
                active={post.begendi}
                disabled={likePending}
                onClick={() => actions.onToggleLike(post)}
              >
                <span>
                  Beğen
                  <span className="sr-only">, </span>
                  <span className="ml-1.5 tabular-nums">{post.begeniSayisi ?? 0}</span>
                  <span className="sr-only"> beğeni</span>
                </span>
              </ActionButton>
            )}
            {actions.onToggleSave && (
              <ActionButton
                icon={saved ? BookmarkSolidIcon : BookmarkIcon}
                pressed={Boolean(saved)}
                active={saved}
                onClick={() => actions.onToggleSave(post)}
              >
                {saved ? "Kaydedildi" : "Kaydet"}
              </ActionButton>
            )}
            {actions.onRemoveSaved && (
              <ActionButton icon={BookmarkSlashIcon} onClick={() => actions.onRemoveSaved(post)}>
                Kaydedilenlerden kaldır
              </ActionButton>
            )}
            {actions.onTogglePin && (
              <ActionButton
                icon={pinned ? MapPinSolidIcon : MapPinIcon}
                pressed={Boolean(pinned)}
                active={pinned}
                onClick={() => actions.onTogglePin(post)}
              >
                {pinned ? "Sabitlemeyi kaldır" : "Başa sabitle"}
              </ActionButton>
            )}
            {actions.onDelete && (
              <ActionButton
                icon={TrashIcon}
                tone="danger"
                label="Gönderiyi sil"
                onClick={() => actions.onDelete(post)}
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-subtle" />
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <div className="size-9 animate-pulse rounded-full bg-subtle" />
          <div className="h-3 w-32 animate-pulse rounded bg-subtle" />
        </div>
        <div className="h-4 w-2/3 animate-pulse rounded bg-subtle" />
        <div className="h-3 w-full animate-pulse rounded bg-subtle" />
      </div>
    </div>
  );
}

export const postGridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-3";
