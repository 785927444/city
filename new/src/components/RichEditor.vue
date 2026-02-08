<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 500px; overflow-y: hidden;"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script lang="ts" setup>
import '@wangeditor/editor/dist/css/style.css'

import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = shallowRef()
const valueHtml = ref('')

onMounted(() => {
    valueHtml.value = props.modelValue
})

watch(() => props.modelValue, (val) => {
    if (val !== valueHtml.value) {
        valueHtml.value = val
    }
})

watch(valueHtml, (val) => {
    emit('update:modelValue', val)
})

const toolbarConfig = {}
const editorConfig = { 
    placeholder: '请输入内容...',
    MENU_CONF: {
        uploadImage: {
            server: '/kb-api/upload',
            fieldName: 'file',
            maxFileSize: 5 * 1024 * 1024,
            maxNumberOfFiles: 10,
            allowedFileTypes: ['image/*'],
            metaWithUrl: false,
            withCredentials: true,
            timeout: 10 * 1000,
            customInsert(res: any, insertFn: any) {
                const url = res.data.url || res.data
                const alt = ''
                const href = res.data.href || ''
                insertFn(url, alt, href)
            },
        }
    }
}

const mode = 'default'

onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor: any) => {
    editorRef.value = editor
}
</script>
