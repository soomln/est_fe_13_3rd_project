import { badRequest, notFound } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';
import {
  DOCUMENT_BUCKET,
  removeDocumentImages,
  sweepOrphanDocumentImages,
} from './storage';

const DOC_TYPES = ['resume', 'cover_letter'];

const SORTS = {
  latest: { column: 'updated_at', ascending: false },
  created: { column: 'created_at', ascending: false },
  title: { column: 'title', ascending: true },
};

const LIST_COLUMNS = 'id, doc_type, title, template_id, created_at, updated_at';

function toItem(row) {
  return {
    id: row.id,
    docType: row.doc_type,
    title: row.title,
    templateId: row.template_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDetail(row) {
  return {
    ...toItem(row),
    content: row.content,
    contentHtml: row.content_html,
    contentText: row.content_text,
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw badRequest('JSON 본문이 필요합니다.');
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const GET = defineRoute(
  async ({ request, supabase, user }) => {
    const q = request.nextUrl.searchParams;

    const page = Math.max(1, Number(q.get('page') ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 10)));
    const sort = SORTS[q.get('sort') ?? 'latest'];
    if (!sort) throw badRequest(`sort 는 ${Object.keys(SORTS).join(' | ')} 중 하나여야 합니다.`);

    const docType = q.get('docType');
    if (docType && !DOC_TYPES.includes(docType)) {
      throw badRequest(`docType 은 ${DOC_TYPES.join(' | ')} 중 하나여야 합니다.`);
    }

    let query = supabase
      .from('documents')
      .select(LIST_COLUMNS, { count: 'exact' })
      .eq('user_id', user.id);

    if (docType) query = query.eq('doc_type', docType);

    const keyword = q.get('q')?.trim();
    if (keyword) query = query.ilike('title', `%${keyword}%`);

    const from = (page - 1) * pageSize;
    const { data, error, count } = await query
      .order(sort.column, { ascending: sort.ascending })
      .range(from, from + pageSize - 1);
    if (error) throw error;

    const all = unwrap(
      await supabase.from('documents').select('id, doc_type').eq('user_id', user.id)
    );

    await sweepOrphanDocumentImages(supabase, user.id, all.map((r) => r.id));

    return {
      items: (data ?? []).map(toItem),
      total: count ?? 0,
      page,
      pageSize,
      counts: {
        all: all.length,
        resume: all.filter((r) => r.doc_type === 'resume').length,
        cover_letter: all.filter((r) => r.doc_type === 'cover_letter').length,
      },
    };
  },
  { auth: true }
);

export const POST = defineRoute(
  async ({ request, supabase, user }) => {
    const body = await readJson(request);

    if (!DOC_TYPES.includes(body.docType)) {
      throw badRequest(`docType 은 ${DOC_TYPES.join(' | ')} 중 하나여야 합니다.`);
    }

    if (body.id != null && !UUID.test(body.id)) {
      throw badRequest('id 는 uuid 형식이어야 합니다.');
    }

    const row = unwrap(
      await supabase
        .from('documents')
        .insert({
          ...(body.id ? { id: body.id } : {}),
          user_id: user.id,
          doc_type: body.docType,
          title: body.title?.trim() || '제목 없음',
          template_id: body.templateId ?? null,
          content: body.content ?? null,
          content_html: body.contentHtml ?? null,
          content_text: body.contentText ?? null,
        })
        .select('*')
        .single()
    );

    return toDetail(row);
  },
  { auth: true }
);

export const DELETE = defineRoute(
  async ({ request, supabase, user }) => {
    const { ids } = await readJson(request);
    if (!Array.isArray(ids) || ids.length === 0) {
      throw badRequest('ids 배열이 필요합니다.');
    }

    const rows = unwrap(
      await supabase.from('documents').delete().eq('user_id', user.id).in('id', ids).select('id')
    );

    await removeDocumentImages(supabase, user.id, (rows ?? []).map((r) => r.id));

    return { deleted: rows?.length ?? 0 };
  },
  { auth: true }
);

export const GET_DETAIL = defineRoute(
  async ({ params, supabase, user }) => {
    const row = unwrap(
      await supabase
        .from('documents')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .maybeSingle()
    );
    if (!row) throw notFound('문서를 찾을 수 없습니다.');
    return toDetail(row);
  },
  { auth: true }
);

export const PATCH_DETAIL = defineRoute(
  async ({ request, params, supabase, user }) => {
    const body = await readJson(request);

    const patch = {};
    if ('title' in body) patch.title = body.title?.trim() || '제목 없음';
    if ('templateId' in body) patch.template_id = body.templateId ?? null;
    if ('content' in body) patch.content = body.content;
    if ('contentHtml' in body) patch.content_html = body.contentHtml;
    if ('contentText' in body) patch.content_text = body.contentText;

    if (Object.keys(patch).length === 0) throw badRequest('수정할 내용이 없습니다.');

    const row = unwrap(
      await supabase
        .from('documents')
        .update(patch)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select('*')
        .maybeSingle()
    );
    if (!row) throw notFound('문서를 찾을 수 없습니다.');

    return toDetail(row);
  },
  { auth: true }
);

export const DELETE_DETAIL = defineRoute(
  async ({ params, supabase, user }) => {
    const rows = unwrap(
      await supabase
        .from('documents')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select('id')
    );
    if (!rows?.length) throw notFound('문서를 찾을 수 없습니다.');

    await removeDocumentImages(supabase, user.id, [params.id]);

    return { deleted: 1 };
  },
  { auth: true }
);

export const GET_IMAGE = defineRoute(
  async ({ params, supabase, user }) => {
    const name = decodeURIComponent(params.name ?? '');
    if (!name || name.includes('/') || name.includes('\\') || name.includes('..')) {
      throw badRequest('잘못된 이미지 이름입니다.');
    }

    const { data, error } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .download(`${user.id}/${params.id}/${name}`);
    if (error || !data) throw notFound('이미지를 찾을 수 없습니다.');

    return new Response(data, {
      headers: {
        'Content-Type': data.type || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  },
  { auth: true }
);

export const DELETE_IMAGES = defineRoute(
  async ({ params, supabase, user }) => {
    await removeDocumentImages(supabase, user.id, [params.id]);
    return { deleted: true };
  },
  { auth: true }
);
