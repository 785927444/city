<template>
  <div class="pagination-container">
    <el-pagination
    :background="background"
    :small="small"
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    :layout="layout"
    :page-sizes="pageSizes"
    :total="total"
    v-bind="$attrs"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
  </div>
</template>

<script lang="ts" setup="props, { emit }">
  import { scrollTo } from '@/utils/scroll-to'
  // import { computed } from 'vue'
  interface Props {
    total?: number
    page?: number
    limit?: number
    pageSizes?: Array<any>
    layout?: string
    background?: boolean
    small?: boolean
    autoScroll?: boolean
  }
  const props = withDefaults(defineProps < Props > (), {
    total: 0,
    page: 0,
    limit: 10,
    pageSizes: () => [10, 20, 50, 100, 500],
    layout: 'total, sizes, prev, pager, next, jumper',
    background: true,
    small: false,
    autoScroll: true
  })
  const emit = defineEmits < (e: 'pagination' | 'update:page' | 'update:limit') => void> ()
  const currentPage: any = computed({
    get() {
      return props.page
    },
    set(val) {
      emit('update:page', val)
    },
  })
  const pageSize: any = computed({
    get() {
      return props.limit
    },
    set(val) {
      emit('update:limit', val)
    },
  })
  const handleCurrentChange = (val: number) => {
    emit('pagination', { page: val, limit: pageSize.value })
    if (props.autoScroll) {
      scrollTo(0, 800)
    }
  }
  const handleSizeChange = (val: number) => {
    emit('pagination', { page: currentPage.value, limit: val })
    if (props.autoScroll) {
      scrollTo(0, 800)
    }
  }
</script>

<style lang="scss">
.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: none;
  padding: 20px 0;
  width: 100%;
}
.pagination-container.hidden {
  display: none;
}
/* 自定义分页样式 */
/* .el-pagination {
  font-size: 13px;
  --el-pagination-button-width: 28px;
  --el-pagination-button-height: 28px;
} */
.el-pagination span{
  color: #fff;
}
.el-select .el-input .el-select__caret.el-icon{
  color: #2663aa;
}
.el-pagination .el-select .el-input{
  width: 100px;
  background: #fff;
  border-radius: 5px;
}
.el-pagination .el-input__inner{
  background: #fff;
  color: #444444;
  font-size: 14px;
  border-radius: 3px;
}
.el-pagination .el-input__wrapper{
  box-shadow: 0 0 0 0 var(--el-input-border-color,var(--el-border-color)) inset;
}
.el-pagination__editor.el-input{
  min-width: 32px;
  min-width: 32px;
}
.el-pagination.is-background .el-pager li:not(.is-disabled).is-active{
  background-color: #0065FF ;
  color: #fff;
  box-shadow: 0 0 0 1px #0065FF  inset;
  border-radius: 5px;
}
.el-pagination.is-background .el-pager li:not(.is-disabled):hover{
  background-color: #0065FF ;
  color: #fff;
  box-shadow: 0 0 0 1px #0065FF  inset;
  border-radius: 5px;
}
.el-pagination.is-background .btn-next, .el-pagination.is-background .btn-prev, .el-pagination.is-background .el-pager li {
  background-color: #fff;
  color: #444444 ;
  border-radius: 5px;
}
.el-pagination.is-background .btn-next, .el-pagination.is-background .btn-prev{
  background-color: #fff;
  color: #606266;
  box-shadow: 0 0 0 1px #fff inset;
  border-radius: 5px;
}
.el-pagination.is-background .btn-next:disabled, .el-pagination.is-background .btn-prev:disabled{
  background-color: #fff;
  color: #606266;
  box-shadow: 0 0 0 1px #fff inset;
  border-radius: 5px;
}
.el-pagination.is-background .el-pager li:not(.is-disabled):hover{
  color: #fff;
}
.el-pagination.btn-next:hover:not([disabled]){
  color: #606266;
}
.el-pagination.is-background, .el-pagination.is-background .btn-prev:hover:not([disabled]){
  color: #fff;
}
.el-select-dropdown__item.selected{
  color: #1F1A41;
}
</style>
