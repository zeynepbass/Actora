"use client";

import { BookmarkIcon } from "@heroicons/react/24/outline";
import { ButtonLink } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { removeFavourite, useFavourites } from "./favourites";
import PostCard, { postGridClass } from "./PostCard";

export default function SavedPosts() {
  const favourites = useFavourites();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Kaydedilenler</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Kaydettiğin gönderiler yalnızca bu cihazda saklanır.
      </p>

      <div className="mt-6">
        {favourites.length === 0 ? (
          <EmptyState
            icon={BookmarkIcon}
            title="Henüz kaydettiğin gönderi yok"
            description="Akışta beğendiğin gönderileri kaydederek daha sonra buradan ulaşabilirsin."
            action={<ButtonLink href="/workouts">Akışa git</ButtonLink>}
          />
        ) : (
          <div className={postGridClass}>
            {favourites.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                actions={{ onRemoveSaved: (item) => removeFavourite(item._id) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
