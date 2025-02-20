import path from "path";
import { FileOperation } from "@server/models";
import { presentUser } from ".";

export default function present(data: FileOperation) {
  return {
    id: data.id,
    type: data.type,
    name: data.collection?.name || path.basename(data.key || ""),
    state: data.state,
    error: data.error,
    size: data.size,
    collectionId: data.collectionId,
    user: presentUser(data.user),
    createdAt: data.createdAt,
  };
}
