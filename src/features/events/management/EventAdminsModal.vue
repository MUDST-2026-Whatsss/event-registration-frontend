<script setup>
import { ConsoleIcon as Icon } from '@/features/console-shell/public.js'

defineProps({
  open: { type: Boolean, default: false },
  event: { type: Object, default: null },
  admins: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
})

defineEmits(['close', 'save', 'toggle'])
</script>

<template>
<Transition name="modal">

  <div
    v-if="open && event"
    class="modal-backdrop"
    @click.self="$emit('close')"
  >

    <div class="admins-modal">

      <div class="modal-header">

        <div>

          <span class="modal-eyebrow">
            Event Management
          </span>

          <h2>
            Manage Event Admins
          </h2>

          <p>
            {{ event.name }}
          </p>

        </div>

        <button
          class="modal-close"
          @click="$emit('close')"
        >

          <Icon
            name="x"
            :size="17"
          />

        </button>

      </div>


      <div class="admins-content">


        <!-- Assigned Admins -->

        <div class="section-title">
          Assigned Admins
        </div>


        <div class="assigned-admins">

          <div
            v-if="selectedIds.length === 0"
            class="no-admins"
          >
            No admins assigned to this event.
          </div>


          <div
            v-for="
              admin in admins.filter(
                (item) =>
                  selectedIds.includes(item.id),
              )
            "
            :key="admin.id"
            class="assigned-admin"
          >

            <!-- KEEP ORIGINAL AVATAR -->

            <img
              :src="admin.avatar"
              :alt="admin.name"
            />


            <div class="admin-info">

              <strong>
                {{ admin.name }}
              </strong>

              <span>
                {{ admin.role }}
              </span>

            </div>

          </div>

        </div>


        <div class="section-divider" />


        <!-- Select Admins -->

        <div class="section-title">
          Manage Event Admins
        </div>

        <p class="admin-description">
          Select the admins responsible for this event.
        </p>


        <div class="admin-options">

          <label
            v-for="admin in admins"
            :key="admin.id"
            class="admin-option"
            :class="{
              selected:
                selectedIds.includes(admin.id),
            }"
          >

            <input
              type="checkbox"
              :checked="
                selectedIds.includes(admin.id)
              "
              @change="$emit('toggle', admin.id)"
            />


            <!-- KEEP ORIGINAL AVATAR -->

            <img
              :src="admin.avatar"
              :alt="admin.name"
            />


            <span class="admin-option-info">

              <strong>
                {{ admin.name }}
              </strong>

              <small>
                {{ admin.role }}
              </small>

            </span>

          </label>

        </div>

      </div>


      <div class="modal-footer actions-footer">

        <button
          class="console-btn console-btn-secondary"
          @click="$emit('close')"
        >
          Cancel
        </button>

        <button
          class="console-btn console-btn-primary"
          @click="$emit('save')"
        >
          Save Changes
        </button>

      </div>

    </div>

  </div>

</Transition>
</template>

<style scoped>
.admins-modal {
  width: min(560px, 100%);

  overflow: hidden;

  border: 1px solid var(--console-border);

  border-radius: 12px;

  background: #fff;

  box-shadow:
    0 22px 60px rgba(15, 23, 42, 0.18);
}
.admins-content {
  max-height: 460px;

  overflow-y: auto;

  padding: 18px 20px;
}
.assigned-admins {
  display: flex;

  flex-direction: column;

  gap: 7px;
}
.assigned-admin {
  min-height: 50px;

  padding: 7px 9px;

  display: flex;
  align-items: center;

  gap: 9px;

  border: 1px solid var(--console-border);

  border-radius: 8px;
}
.assigned-admin img,
.admin-option img {
  width: 30px;
  height: 30px;

  flex-shrink: 0;

  object-fit: cover;

  border-radius: 50%;
}
.no-admins {
  padding: 13px;

  border: 1px dashed var(--console-border);

  border-radius: 7px;

  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);

  text-align: center;
}
.admin-option img {
  width: 30px;
  height: 30px;

  flex-shrink: 0;

  object-fit: cover;

  border-radius: 50%;
}
.admin-option {
  min-height: 48px;

  padding: 7px 9px;

  display: flex;
  align-items: center;

  gap: 8px;

  border: 1px solid var(--console-border);

  border-radius: 8px;

  cursor: pointer;

  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.admin-option:hover,
.admin-option.selected {
  border-color: var(--console-primary);

  background: var(--console-primary-soft);
}
.admin-option input {
  width: 13px;
  height: 13px;

  accent-color: var(--console-primary);

  cursor: pointer;
}
.admin-option-info {
  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 2px;
}
.admin-option-info strong {
  overflow: hidden;

  color: var(--console-text);

  font-size: var(--console-fs-2xs);

  white-space: nowrap;

  text-overflow: ellipsis;
}
.admin-option-info small {
  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
}
.admin-options {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 7px;
}
.admin-info {
  flex: 1;

  display: flex;

  flex-direction: column;

  gap: 2px;
}
.admin-info strong {
  color: var(--console-text);

  font-size: var(--console-fs-xs);
}
.admin-info span {
  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
}
.admin-description {
  margin: -2px 0 10px;

  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
}
.admin-option-info {
  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 2px;
}
.admin-option-info strong {
  overflow: hidden;

  color: var(--console-text);

  font-size: var(--console-fs-2xs);

  white-space: nowrap;

  text-overflow: ellipsis;
}
.admin-option-info small {
  color: var(--console-text-muted);

  font-size: var(--console-fs-2xs);
}
.actions-footer {
  justify-content: flex-end;

  gap: 8px;
}
.section-divider {
  height: 1px;

  margin: 18px 0;

  background: var(--console-border-soft);
}
.section-title {
  margin-bottom: 9px;

  color: var(--console-text);

  font-size: var(--console-fs-2xs);

  font-weight: 700;
}

@media (max-width: 520px) {
  .admin-options {
    grid-template-columns: 1fr;
  }

  .actions-footer {
    align-items: stretch;
    flex-direction: column-reverse;
  }

  .actions-footer .console-btn {
    justify-content: center;
    width: 100%;
  }
}
</style>
