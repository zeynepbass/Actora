import { api } from "@/lib/apiClient";

export const postsQueryKey = ["posts"];

export const fetchPosts = () => api.get("/post").then((res) => res.data);

export const createPost = (formData) => api.post("/post", formData).then((res) => res.data);

export const deletePost = (id) => api.delete(`/post/${id}`).then((res) => res.data);

export const toggleLike = (id) => api.post(`/post/${id}/begen`).then((res) => res.data);
