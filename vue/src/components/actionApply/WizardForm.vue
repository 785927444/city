<template>
  <div class="layout-col">
    <ActionApplyStep1
      ref="step1Ref"
      v-show="wizardState.actIndex === 1"
      :state="wizardState.state"
      :contents="wizardState.state.contents1"
      :active="wizardState.state.active1"
      :plans="wizardState.state.plans1"
      :is-readonly="wizardState.readonly"
      @next="actions.next"
    />
    <ActionApplyStep2
      ref="step2Ref"
      v-show="wizardState.actIndex === 2"
      :state="wizardState.state"
      :contents="wizardState.state.contents2"
      :active="wizardState.state.active2"
      :plans="wizardState.state.plans2"
      :is-readonly="wizardState.readonly"
      @prev="actions.prev"
      @next="actions.next"
      @save="handleSave"
    />
    <ActionApplyStep3
      ref="step3Ref"
      v-show="wizardState.actIndex === 3"
      :state="wizardState.state"
      :contents="wizardState.state.contents3"
      :active="wizardState.state.active3"
      :plans="wizardState.state.plans3"
      :contents1="wizardState.state.contents4"
      :active1="wizardState.state.active4"
      :plans1="wizardState.state.plans4"
      :is-readonly="wizardState.readonly"
      @prev="actions.prev"
      @save="handleSave"
    />
  </div>
</template>

<script lang="ts" setup>
import ActionApplyStep1 from './steps/ActionApplyStep1.vue'
import ActionApplyStep2 from './steps/ActionApplyStep2.vue'
import ActionApplyStep3 from './steps/ActionApplyStep3.vue'
import { useWizardState } from './composables/useWizardState'
import { useWizardActions } from './composables/useWizardActions'
import { projectWizardService } from './services/projectWizardService'

const step1Ref = ref<any>(null)
const step2Ref = ref<any>(null)
const step3Ref = ref<any>(null)

const wizardState = useWizardState()
const actions = useWizardActions({
  wizardState,
  stepRefs: [step1Ref, step2Ref, step3Ref],
  service: projectWizardService
})

const handleSave = async (status?: string) => {
  await actions.saveDraft(status)
}

defineExpose({
  init: actions.init,
  validate: actions.validate,
  next: actions.next,
  prev: actions.prev,
  saveDraft: actions.saveDraft,
  submit: actions.submit,
  getData: actions.getData,
  setData: actions.setData,
  reset: actions.reset
})
</script>
