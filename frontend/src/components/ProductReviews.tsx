import { useState } from 'react';
import { submitReview } from '../api';
import type { ProductDetail, ProductReview } from '../types';
import { StarRating } from './StarRating';

export function ProductReviews({
  product,
  onSaved,
}: {
  product: ProductDetail;
  onSaved: () => Promise<void> | void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState<string | 'new' | null>(
    product.canReview && product.reviews.every((item) => !item.mine)
      ? 'new'
      : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setRating(0);
    setComment('');
    setError(null);
    setEditingId('new');
  };

  const startEdit = (review: ProductReview) => {
    setRating(review.rating);
    setComment(review.comment);
    setError(null);
    setEditingId(review.id);
  };

  const save = async () => {
    if (rating < 0.5) {
      setError('Choose a star rating.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await submitReview(
        product.slug,
        rating,
        comment,
        editingId && editingId !== 'new' ? editingId : undefined,
      );
      await onSaved();
      setEditingId(null);
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-semibold text-slate-900">Ratings & reviews</h3>
          {product.reviewCount > 0 ? (
            <p className="text-sm text-slate-500">
              {product.avgRating} / 5 · {product.reviewCount} review
              {product.reviewCount === 1 ? '' : 's'}
            </p>
          ) : (
            <p className="text-sm text-slate-500">No reviews yet</p>
          )}
        </div>
        {product.canReview && editingId === null ? (
          <button
            type="button"
            onClick={startNew}
            className="text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            Write a review
          </button>
        ) : null}
      </div>

      {product.canReview && editingId ? (
        <ReviewForm
          title={editingId === 'new' ? 'Write a review' : 'Update your review'}
          rating={rating}
          comment={comment}
          error={error}
          saving={saving}
          submitLabel={editingId === 'new' ? 'Post review' : 'Update review'}
          onRating={setRating}
          onComment={setComment}
          onSave={save}
          onCancel={() => {
            setEditingId(null);
            setError(null);
          }}
        />
      ) : null}

      {!product.canReview ? (
        <p className="mt-3 text-sm text-slate-500">
          Buy this product to leave a rating and comment.
        </p>
      ) : null}

      {product.reviews.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {product.reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">
                  {review.mine ? 'You' : review.userName}
                </p>
                <StarRating value={review.rating} size="sm" />
              </div>
              <div className="mt-2 flex items-start gap-2">
                <p className="min-w-0 flex-1 text-sm text-slate-600">
                  {review.comment}
                </p>
                {review.mine && editingId !== review.id ? (
                  <button
                    type="button"
                    aria-label="Edit review"
                    onClick={() => startEdit(review)}
                    className="shrink-0 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-700"
                  >
                    <PencilIcon />
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ReviewForm({
  title,
  rating,
  comment,
  error,
  saving,
  submitLabel,
  onRating,
  onComment,
  onSave,
  onCancel,
}: {
  title: string;
  rating: number;
  comment: string;
  error: string | null;
  saving: boolean;
  submitLabel: string;
  onRating: (value: number) => void;
  onComment: (value: string) => void;
  onSave: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      <div className="mt-2">
        <StarRating value={rating} onChange={onRating} />
      </div>
      <div className="relative mt-3">
        <span className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
          <PencilIcon />
        </span>
        <textarea
          value={comment}
          onChange={(event) => onComment(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Share what you liked or what could be better"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-10 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:bg-slate-300"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20h4l10.5-10.5a1.8 1.8 0 0 0-2.5-2.5L5.5 17.5 4 20z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}
