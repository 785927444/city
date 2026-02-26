import request from '@/utils/request'

type KbColumn = {
  code: string
  name: string
  desc?: string
  count?: number
  children?: Array<{ id: string; name: string }>
}

type KbCategory = {
  id: string
  column_code: string
  name: string
  sort_no: number
}

type KbAttachment = {
  id: string
  item_id: string
  file_name: string
  file_type: string
  file_size: number
}

type KbItem = {
  id: string | number
  column_code: string
  column_name: string
  category_id?: string
  category_name?: string
  category_ids?: string[]
  category_names?: string[]
  author?: string
  created_at?: string
  updated_at?: string
  download_count?: number
  favorite_count?: number
  is_favorited?: boolean
  attachments?: KbAttachment[]
  title: string
  summary: string
  publish_org: string
  doc_no: string
  publish_time: string
  views: number
  content: string
  image_urls?: string[]
  user_id?: string
  view_count?: number
  collect_count?: number
  subtitle?: string
  tags?: string
  is_top?: number
  seo_keywords?: string
}

type KbMockDb = {
  columns: Array<KbColumn>
  categories: Array<KbCategory>
  attachments: Array<KbAttachment>
  items: Array<KbItem>
}

let kbMockDb: KbMockDb | null = null
const kbMockFavorites: Record<string, Set<string>> = {}

function formatDate(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatDateTime(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

function normalizeQ(v: any) {
  return String(v ?? '').trim().toLowerCase()
}

function pickPage<T>(arr: T[], page: number, limit: number) {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20
  const start = (safePage - 1) * safeLimit
  return arr.slice(start, start + safeLimit)
}

function buildKbMockDb(): KbMockDb {
  const columns: Array<KbColumn> = [
    { code: 'policy', name: '政策法规', desc: '城市体检、城市更新等政策法规文件' },
    { code: 'standard', name: '标准规范', desc: '行业标准规范与技术指引' },
    { code: 'mechanism', name: '工作机制', desc: '组织架构、联席会议与流程制度' },
    { code: 'expert', name: '专家智库', desc: '专家信息、研究方向与成果简介' },
    { code: 'case', name: '优秀案例', desc: '典型案例、做法经验与成效总结' },
    { code: 'course', name: '培训课程', desc: '培训课程、讲义提纲与学习要点' },
  ]

  const categoryInit: Record<string, string[]> = {
    policy: ['城市体检', '城市更新', '城市设计', '人居环境改善'],
    standard: ['城市体检', '城市更新', '城市设计', '人居环境改善'],
    mechanism: ['城市更新专项小组', '城市更新工作联席会议', '人居环境改善工作机制'],
    expert: ['城市体检', '城市更新', '城市设计', '人居环境改善'],
    case: ['城市体检', '城市更新', '城市设计', '人居环境改善'],
    course: ['城市体检', '城市更新', '城市设计', '人居环境改善'],
  }
  const categories: Array<KbCategory> = []
  let catNo = 1
  for (const c of columns) {
    const names = categoryInit[c.code] ?? []
    names.forEach((name, idx) => {
      categories.push({
        id: `cat-${catNo++}`,
        column_code: c.code,
        name,
        sort_no: (idx + 1) * 10,
      })
    })
  }

  const orgs = [
    '住房和城乡建设局',
    '自然资源和规划局',
    '城市更新中心',
    '市政工程管理处',
    '人居环境改善专班',
    '城市体检评估工作组',
    '城乡建设研究院',
    '规划设计研究院',
  ]

  const areas = ['城市体检', '城市更新', '城市设计', '人居环境改善', '韧性城市', '智慧城市']
  const levels = ['国家层面', '省级层面', '市级层面', '区县层面']
  const topics = [
    '指标体系',
    '数据治理',
    '空间品质',
    '公共服务',
    '老旧小区',
    '历史街区',
    '市政设施',
    '生态修复',
    '风险防控',
    '实施路径',
  ]

  const baseDate = new Date()
  const items: Array<KbItem> = []
  const attachments: Array<KbAttachment> = []

  const titleTpl: Record<string, (i: number) => string> = {
    policy: (i) => `关于推进${areas[i % areas.length]}工作的若干意见（试行）第${i}号`,
    standard: (i) => `${areas[i % areas.length]}技术标准与评估规范（202${(i % 4) + 2}版）第${i}条`,
    mechanism: (i) => `${areas[i % areas.length]}工作机制与联动流程（第${i}版）`,
    expert: (i) => `专家库：${topics[i % topics.length]}方向专家简介（编号${i}）`,
    case: (i) => `优秀案例：${areas[i % areas.length]}示范项目成效总结（案例${i}）`,
    course: (i) => `培训课程：${topics[i % topics.length]}专题（第${i}讲）`,
  }

  const summaryTpl: Record<string, (i: number) => string> = {
    policy: (i) => `围绕${areas[i % areas.length]}提出目标、任务分工与保障措施。`,
    standard: (i) => `给出${topics[i % topics.length]}相关指标口径、方法与判定规则。`,
    mechanism: () => `明确职责分工、流程节点、协同机制与材料清单。`,
    expert: (i) => `覆盖${topics[i % topics.length]}研究方向，提供咨询与评审支撑。`,
    case: () => `总结项目背景、做法、指标提升与可复制经验。`,
    course: (i) => `以${topics[i % topics.length]}为主线，包含学习目标与要点梳理。`,
  }

  const docNoTpl: Record<string, (i: number) => string> = {
    policy: (i) => `建城〔202${(i % 4) + 2}〕${String(i).padStart(2, '0')}号`,
    standard: (i) => `GB/T ${2020 + (i % 6)}-${100 + i}`,
    mechanism: (i) => `机〔202${(i % 4) + 2}〕${String(i).padStart(2, '0')}`,
    expert: (i) => `EX-${2025 - (i % 3)}-${String(i).padStart(3, '0')}`,
    case: (i) => `CASE-${2024 + (i % 3)}-${String(i).padStart(3, '0')}`,
    course: (i) => `COURSE-${2024 + (i % 3)}-${String(i).padStart(3, '0')}`,
  }

  const buildLongContent = (args: { title: string; lvl: string; area: string; topic: string }) => {
    const p =
      `为更好推进${args.area}相关工作，结合${args.lvl}要求与${args.topic}重点，现将有关情况梳理如下：` +
      `本材料用于演示展示效果，内容为示例文本，可根据实际项目材料替换。` +
      `在实施过程中，应坚持问题导向、目标导向与结果导向相统一，做到数据可追溯、过程可检查、成效可评估。` +
      `同时强调部门协同、上下联动与公众参与，形成可复制、可推广的工作机制与经验做法。`

    const p2 =
      `一是完善组织保障。建立统筹协调机制，明确牵头部门与责任分工，形成“任务清单—责任清单—时限清单”。` +
      `二是夯实数据底座。统一口径标准，推动数据治理与共享交换，确保基础数据真实、准确、完整、及时。` +
      `三是优化实施路径。围绕重点片区、重点项目与重点指标，分阶段推进、分步骤落地，强化过程管理与闭环整改。` +
      `四是强化风险防控。关注资金、工程、运营与安全等风险点，完善预案与应急处置机制，守住底线。`

    const p3 =
      `在指标体系方面，建议从空间品质、公共服务、市政设施、生态修复、韧性安全等维度进行综合评估；` +
      `在项目策划方面，兼顾短期可落地与长期可持续，既突出民生获得感，也注重城市发展质量；` +
      `在成果应用方面，加强成果转化，推动评估结论进入项目库、进入年度计划、进入考核体系，形成常态化工作。`

    const blocks = Array.from({ length: 18 }).map((_, idx) => `<p>${idx % 3 === 0 ? p : idx % 3 === 1 ? p2 : p3}</p>`)
    const head = [
      `<p><strong>${args.title}</strong></p>`,
      `<p>级别：${args.lvl}；领域：${args.area}；主题：${args.topic}。</p>`,
    ].join('')
    return head + blocks.join('')
  }

  for (const c of columns) {
    const cats = categories.filter((x) => x.column_code === c.code)
    for (let i = 1; i <= 20; i += 1) {
      const d = new Date(baseDate)
      d.setDate(d.getDate() - (i * 6 + c.code.length))
      const publish_time = formatDate(d)
      const created_at = formatDateTime(d)
      const updated_at = formatDateTime(new Date(d.getTime() + 1000 * 60 * 60 * 24))
      const area = areas[(i + c.code.length) % areas.length]
      const lvl = levels[(i + 1) % levels.length]
      const t = topics[(i + 3) % topics.length]
      const org = orgs[(i + c.code.length) % orgs.length]
      const title = titleTpl[c.code]?.(i) ?? `${c.name}条目${i}`
      const summary = summaryTpl[c.code]?.(i) ?? `关于${area}的内容摘要。`
      const doc_no = docNoTpl[c.code]?.(i) ?? `${c.code.toUpperCase()}-${i}`
      const implementation_time = c.code === 'standard' ? formatDate(new Date(d.getTime() + 1000 * 60 * 60 * 24 * 30)) : ''
      const fields_involved = c.code === 'standard' ? `${area}、${t}` : ''
      const views = 200 + (20 - i) * 13 + c.code.length * 7
      const content = buildLongContent({ title, lvl, area, topic: t })

      const picked = cats.length
        ? [cats[(i - 1) % cats.length], cats[i % cats.length], i % 3 === 0 ? cats[(i + 1) % cats.length] : null]
            .filter(Boolean)
            .map((x) => x as KbCategory)
        : []
      const uniq = picked.reduce<KbCategory[]>((acc, cur) => {
        if (acc.some((x) => x.id === cur.id)) return acc
        acc.push(cur)
        return acc
      }, [])
      const cat = uniq[0] ?? null
      const id = `${c.code}-${i}`
      const author = i % 2 === 0 ? '系统管理员' : '业务专员'
      const download_count = 10 + (i % 7) * 3
      const favorite_count = 2 + (i % 5)
      const itemAttachments: KbAttachment[] = [
        {
          id: `att-${id}-1`,
          item_id: String(id),
          file_name: `${title.slice(0, 16)}-附件1.pdf`,
          file_type: 'pdf',
          file_size: 120000 + i * 33,
        },
        {
          id: `att-${id}-2`,
          item_id: String(id),
          file_name: `${title.slice(0, 16)}-附件2.docx`,
          file_type: 'docx',
          file_size: 240000 + i * 21,
        },
        {
          id: `att-${id}-3`,
          item_id: String(id),
          file_name: `${title.slice(0, 16)}-附件3.xlsx`,
          file_type: 'xlsx',
          file_size: 360000 + i * 19,
        },
      ]
      attachments.push(...itemAttachments)
      items.push({
        id,
        column_code: c.code,
        column_name: c.name,
        category_id: cat?.id,
        category_name: cat?.name,
        category_ids: uniq.map((x) => x.id),
        category_names: uniq.map((x) => x.name),
        author,
        created_at,
        updated_at,
        download_count,
        favorite_count,
        is_favorited: false,
        attachments: itemAttachments,
        title,
        summary,
        publish_org: org,
        doc_no,
        implementation_time,
        fields_involved,
        publish_time,
        views,
        content,
        image_urls:
          c.code === 'expert'
            ? ['/static/uploads/zhuanjia.png']
            : c.code === 'case'
              ? ['/static/uploads/youxiuanli.png']
              : [],
      })
    }
  }

  const columnsWithChildren = columns.map((c) => {
    const children = categories
      .filter((x) => x.column_code === c.code)
      .sort((a, b) => a.sort_no - b.sort_no)
      .map((x) => ({ id: x.id, name: x.name }))
    return { ...c, children }
  })

  return { columns: columnsWithChildren, categories, attachments, items }
}

function getKbMockDb(): KbMockDb {
  if (kbMockDb) return kbMockDb
  kbMockDb = buildKbMockDb()
  return kbMockDb
}

async function requestOrMock(
  cfg: { headers: any; url: any; method: any; data: any },
  mockFactory: () => any
) {
  const rawUrl = typeof cfg?.url === 'string' ? cfg.url : ''
  const isKb = rawUrl.startsWith('/kb-api/')
  const kbOrigin =
    (import.meta as any)?.env?.VITE_KB_API_ORIGIN || (import.meta as any)?.env?.VITE_KB_URL || 'http://127.0.0.1:9010'
  const cfg2 =
    (import.meta as any)?.env?.DEV && isKb && !/^https?:\/\//i.test(rawUrl) ? { ...cfg, url: `${kbOrigin}${rawUrl}` } : cfg
  try {
    const res: any = await (request as any)(cfg2 as any)
    if (res === false || res == null) return mockFactory()
    return res
  } catch (e) {
    return mockFactory()
  }
}

const api:any = {
  httpApi(data: any, url: any = "/api/v1/terminal/base/handleHttp", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  systemApi(data: any, url: any = "/api/v1/terminal/base/system", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  codeApi(data: any, url: any = "/api/v1/terminal/user/code", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  sendCodeApi(data: any, url: any = "/api/v1/terminal/user/sendCode", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  loginApi(data: any, url: any = "/api/v1/terminal/user/login", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  uploadApi(data: any, url: any = "/api/v1/terminal/base/uploadFile", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  changeFileApi(data: any, url: any = "/api/v1/terminal/base/changeFile", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  deleteFile(data: any, url: any = "/api/v1/terminal/base/deleteFile", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  getApi(data: any, url: any = "/api/v1/terminal/high/get", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  setApi(data: any, url: any = "/api/v1/terminal/high/set", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  addApi(data: any, url: any = "/api/v1/terminal/middle/add", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  addApi1(data: any, url: any = "/api/v1/terminal/middle/add", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  }, 

  addApi2(data: any, url: any = "/api/v1/terminal/middle/add", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  }, 

  updApi(data: any, url: any = "/api/v1/terminal/middle/upd", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  updApi1(data: any, url: any = "/api/v1/terminal/middle/upd", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  updApi2(data: any, url: any = "/api/v1/terminal/middle/upd", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  delApi(data: any, url: any = "/api/v1/terminal/middle/del", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  delApi1(data: any, url: any = "/api/v1/terminal/middle/del", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  delApi2(data: any, url: any = "/api/v1/terminal/middle/del", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  logApi(data: any, url: any = "/api/v1/terminal/middle/log", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  Api(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api1(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api2(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api3(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api4(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  Api5(data: any, url: any = "/api/v1/terminal/middle/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  queryApi(data: any, url: any = "/api/v1.0/p3000/middata/query", headers: any = {}, method: any = 'post') {
    return request({
      url: url,
      headers: headers,
      method: method,
      data: data
    })
  },

  remote(data: any, url: any = "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/remoteCtrl", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },
  
  remotes(data: any, url: any = "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/remoteCtrls", headers: any = {}, method: any = 'post') {
    return request({
      headers: headers,
      url: url,
      method: method,
      data: data
    })
  },

  // remotes(data: any, url: any = "/api/v1.0/p3000/monitorOnline/commFrontEndProcessor/sensor/dlqremoteCtrl", headers: any = {}, method: any = 'post') {
  //   return request({
  //     headers: headers,
  //     url: url,
  //     method: method,
  //     data: data
  //   })
  // },

  kbColumnsApi(data: any, url: any = "/kb-api/columns", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        return { code: 200, data: { columns: db.columns } }
      }
    )
  },

  kbCategoryAddApi(data: any, url: any = "/kb-api/category/add", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        const column_code = String(data?.column_code ?? '').trim()
        const name = String(data?.name ?? '').trim()
        if (!column_code || !name) return { code: 400, data: { category: null } }
        const id = `cat-${Date.now()}`
        db.categories.push({ id, column_code, name, sort_no: 999 })
        db.columns = db.columns.map((c) => {
          if (c.code !== column_code) return c
          const children = [...(c.children ?? []), { id, name }]
          return { ...c, children }
        })
        return { code: 200, data: { category: { id, column_code, name } } }
      }
    )
  },

  kbMyArticleListApi(data: any, url: any = "/kb-api/article/my-list", headers: any = {}, method: any = 'post') {
    return request({ headers, url, method, data })
  },

  kbArticleCreateApi(data: any, url: any = "/kb-api/article/create", headers: any = {}, method: any = 'post') {
    return request({ headers, url, method, data })
  },

  kbArticleUpdateApi(data: any, url: any = "/kb-api/article/update", headers: any = {}, method: any = 'post') {
    return request({ headers, url, method, data })
  },

  kbColumnAddApi(data: any, url: any = "/kb-api/column/add", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        db.columns.push({ ...data, children: [] })
        return { code: 200, message: 'success' }
      }
    )
  },

  kbColumnUpdateApi(data: any, url: any = "/kb-api/column/update", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        const idx = db.columns.findIndex(c => c.code === data.code)
        if (idx !== -1) {
          db.columns[idx] = { ...db.columns[idx], ...data }
        }
        return { code: 200, message: 'success' }
      }
    )
  },

  kbColumnDeleteApi(data: any, url: any = "/kb-api/column/delete", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        db.columns = db.columns.filter(c => c.code !== data.code)
        db.categories = db.categories.filter(c => c.column_code !== data.code)
        return { code: 200, message: 'success' }
      }
    )
  },

  kbCategoryUpdateApi(data: any, url: any = "/kb-api/category/update", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        const idx = db.categories.findIndex(c => c.id === data.id)
        if (idx !== -1) {
          db.categories[idx] = { ...db.categories[idx], ...data }
          // 同步更新 columns 里的 children
          db.columns.forEach(col => {
            if (col.children) {
              const cIdx = col.children.findIndex(c => c.id === data.id)
              if (cIdx !== -1) {
                col.children[cIdx].name = data.name
              }
            }
          })
        }
        return { code: 200, message: 'success' }
      }
    )
  },

  kbCategoryDeleteApi(data: any, url: any = "/kb-api/category/delete", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        db.categories = db.categories.filter(c => c.id !== data.id)
        db.columns.forEach(col => {
          if (col.children) {
            col.children = col.children.filter(c => c.id !== data.id)
          }
        })
        return { code: 200, message: 'success' }
      }
    )
  },

  kbArticleDeleteApi(data: any, url: any = "/kb-api/article/delete", headers: any = {}, method: any = 'post') {
    return request({ headers, url, method, data })
  },

  kbAdminUserFavoritesApi(data: any, url: any = "/kb-api/admin/user-favorites", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        const user_id = String(data?.user_id ?? '').trim() || 'anonymous'
        const favSet = kbMockFavorites[user_id] ?? new Set<string>()
        kbMockFavorites[user_id] = favSet
        const items = Array.from(favSet)
          .map((id) => db.items.find((it) => String(it.id) === String(id)))
          .filter(Boolean)
          .map((it: any) => ({
            id: it.id,
            title: it.title,
            column_code: it.column_code,
            column_name: it.column_name,
            publish_time: it.publish_time,
            download_count: Number(it.download_count ?? 0),
            favorite_count: Number(it.favorite_count ?? 0),
            favorited_at: it.publish_time || it.created_at || '',
          }))
        const statsMap: Record<string, { name: string; value: number }> = {}
        items.forEach((it: any) => {
          const key = String(it.column_code ?? it.column_name ?? '')
          if (!key) return
          if (!statsMap[key]) statsMap[key] = { name: String(it.column_name ?? it.column_code ?? ''), value: 0 }
          statsMap[key].value += 1
        })
        const stats = Object.values(statsMap).sort((a, b) => b.value - a.value)
        return { code: 200, data: { items, stats, total: items.length } }
      }
    )
  },

  kbDocExtractApi(data: any, url: any = "/kb-api/doc/extract-text", headers: any = {}, method: any = 'post') {
    return request({ headers, url, method, data })
  },

  kbUploadFileApi(data: any, url: any = "/kb-api/upload", headers: any = {}, method: any = 'post') {
    return request({ headers, url, method, data })
  },

  kbHotApi(data: any, url: any = "/kb-api/hot", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        const fixedIds = [
          'policy-3',
          'policy-8',
          'standard-2',
          'standard-11',
          'mechanism-5',
          'mechanism-14',
          'expert-6',
          'case-4',
          'case-17',
          'course-9',
        ]

        const fixed = fixedIds
          .map((id) => db.items.find((it) => it.id === id))
          .filter(Boolean) as KbItem[]

        const need = 10 - fixed.length
        const fallback =
          need > 0
            ? [...db.items]
                .filter((it) => !fixedIds.includes(String(it.id)))
                .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
                .slice(0, need)
            : []

        const items = [...fixed, ...fallback].slice(0, 10).map((it) => ({
          id: it.id,
          title: it.title,
          summary: it.summary,
          column_code: it.column_code,
          column_name: it.column_name,
        }))
        return { code: 200, data: { items } }
      }
    )
  },

  kbItemsApi(data: any, url: any = "/kb-api/items", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        const columnCode = String(data?.column_code ?? '').trim()
        const categoryId = String(data?.category_id ?? '').trim()
        const q = normalizeQ(data?.q)
        const page = Number(data?.page ?? 1) || 1
        const limit = Number(data?.limit ?? 20) || 20

        let filtered = db.items
        if (columnCode) filtered = filtered.filter((it) => it.column_code === columnCode)
        if (categoryId) {
          filtered = filtered.filter((it) => {
            const ids = it.category_ids
            if (Array.isArray(ids) && ids.length) return ids.map(String).includes(categoryId)
            return String(it.category_id ?? '') === categoryId
          })
        }
        if (q) {
          filtered = filtered.filter((it) => {
            const hay = normalizeQ(
              [
                it.title,
                it.summary,
                it.publish_org,
                it.doc_no,
                it.publish_time,
                it.content,
                it.category_name,
                Array.isArray(it.category_names) ? it.category_names.join(' ') : '',
                it.column_name,
              ].join(' ')
            )
            return hay.includes(q)
          })
        }

        const total = filtered.length
        const items = pickPage(filtered, page, limit)
        return { code: 200, data: { items, total } }
      }
    )
  },

  kbItemApi(data: any, url: any = "/kb-api/item", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        const id = String(data?.id ?? '').trim()
        const user_id = String(data?.user_id ?? '').trim() || 'anonymous'
        const item = db.items.find((it) => String(it.id) === id) ?? null
        if (!item) return { code: 200, data: { item: null } }
        const favSet = kbMockFavorites[user_id] ?? new Set<string>()
        kbMockFavorites[user_id] = favSet
        const attachments = db.attachments.filter((a) => String(a.item_id) === String(item.id))
        const out = {
          ...item,
          is_favorited: favSet.has(String(item.id)),
          attachments,
        }
        return { code: 200, data: { item: out } }
      }
    )
  },

  kbFavoriteToggleApi(data: any, url: any = "/kb-api/favorite/toggle", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        const user_id = String(data?.user_id ?? '').trim() || 'anonymous'
        const item_id = String(data?.item_id ?? '').trim()
        if (!item_id) return { code: 400, data: { is_favorited: false, favorite_count: 0 } }
        const favSet = kbMockFavorites[user_id] ?? new Set<string>()
        kbMockFavorites[user_id] = favSet
        const it = db.items.find((x) => String(x.id) === item_id)
        if (!it) return { code: 200, data: { is_favorited: false, favorite_count: 0 } }
        let is_favorited = false
        if (favSet.has(item_id)) {
          favSet.delete(item_id)
          is_favorited = false
          it.favorite_count = Math.max(0, Number(it.favorite_count ?? 0) - 1)
        } else {
          favSet.add(item_id)
          is_favorited = true
          it.favorite_count = Number(it.favorite_count ?? 0) + 1
        }
        return { code: 200, data: { is_favorited, favorite_count: it.favorite_count } }
      }
    )
  },

  kbItemDownloadAllApi(data: any, url: any = "/kb-api/item/download_all", headers: any = {}, method: any = 'post') {
    return requestOrMock(
      { headers, url, method, data },
      () => {
        const db = getKbMockDb()
        const item_id = String(data?.item_id ?? '').trim()
        const it = db.items.find((x) => String(x.id) === item_id)
        if (!it) return { code: 400, data: { download_url: '', download_count: 0 } }
        it.download_count = Number(it.download_count ?? 0) + 1
        return { code: 200, data: { download_url: '', download_count: it.download_count } }
      }
    )
  },

  kbArticleStatsApi(data: any, url: any = "/kb-api/article", headers: any = {}, method: any = 'get') {
      if (method === 'post') {
        return request({ headers, url: `${url}/${data.id}/stats`, method, data: data.data })
      }
      return request({ headers, url: `${url}/${data.id}/stats`, method })
  },

}

export default api
