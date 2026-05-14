<template>
  <div class="dashboard">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-logo"><span class="logo-text">MENU</span></div>
      </div>
      <SidebarNav
        :current-page="currentPage"
        :active-section="activeSection"
        :nav-items="navItems"
        :section-count="sectionCount"
        @page="handlePage"
        @section="switchSection"
        @logout="handleLogout"
      />
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="topbar-left">
          <ol class="breadcrumb mt-3">
            <li class="breadcrumb-item">
              <a href="#" @click.prevent="handlePage('dashboard')">Dashboard</a>
            </li>
            <li v-if="currentPage === 'content'" class="breadcrumb-item">
              <a href="#" @click.prevent="view = 'list'">{{
                currentNav.label
              }}</a>
            </li>
            <li
              v-if="currentPage === 'content' && view !== 'list'"
              class="breadcrumb-item active"
            >
              <a>{{ view === "create" ? "เพิ่มใหม่" : "แก้ไข" }}</a>
            </li>
            <li v-if="currentPage === 'contact'" class="breadcrumb-item active">
              <a>Contact</a>
            </li>
            <li v-if="currentPage === 'ads'" class="breadcrumb-item active">
              <a>Ads Banner</a>
            </li>
          </ol>
        </div>
        <div class="topbar-right">
          <div class="avatar-wrap">
            <div class="avatar">A</div>
            <div class="avatar-info">
              <span class="avatar-name">Admin</span>
            </div>
          </div>
        </div>
      </header>

      <!-- ───── DASHBOARD PAGE ───── -->
      <div v-if="currentPage === 'dashboard'" class="view-wrap">
        <Dashboard
          :banner-api="bannersApi"
          :dashboard-api="dashboardApi"
          :show-toast="showToast"
        />
      </div>

      <!-- ───── CONTENT PAGE ───── -->
      <template v-if="currentPage === 'content'">
        <div v-if="view === 'list'" class="view-wrap">
          <section class="section-card">
            <div class="section-head">
              <div>
                <h3 class="section-title">
                  <i class="bi bi-image me-2" />Banner
                </h3>
                <p class="section-sub">แบนเนอร์หน้า {{ currentNav.label }}</p>
              </div>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="d-none"
              @change="onFileChange"
            />
            <div class="banner-grid">
              <div
                v-if="!currentBanners.length"
                class="banner-dropzone"
                :class="{ dragover: isDragOver }"
                @dragover.prevent="isDragOver = true"
                @dragleave="isDragOver = false"
                @drop.prevent="onDrop"
                @click="triggerUpload"
              >
                <div class="dropzone-inner">
                  <i class="bi bi-cloud-arrow-up" />
                  <p>Drop image or <strong>click to browse</strong></p>
                </div>
              </div>
              <div
                v-for="(banner, i) in currentBanners"
                :key="banner.id || i"
                class="banner-thumb"
              >
                <img :src="resolveBannerUrl(banner.url)" :alt="banner.name" />
                <div class="banner-overlay">
                  <div></div>
                  <div class="banner-actions">
                    <button
                      class="thumb-btn danger"
                      @click="removeBanner(banner)"
                    >
                      <i class="bi bi-trash3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="section-card">
            <div class="section-head">
              <div>
                <h3 class="section-title">Content List</h3>
                <p class="section-sub">ทั้งหมด {{ meta.total ?? 0 }} รายการ</p>
              </div>
              <div>
                <button class="btn-primary" @click="openCreate">
                  <i class="bi bi-plus-lg me-2" />Add Content
                </button>
                <button class="btn-outline btn-sm ms-2" @click="fetchPosts">
                  <i
                    class="bi bi-arrow-clockwise"
                    :class="{ 'spin-animation': isSpinning }"
                  />
                </button>
              </div>
            </div>
            <div class="list-filters">
              <div class="search-wrap">
                <i class="bi bi-search" />
                <input
                  v-model="search"
                  type="text"
                  placeholder="Search..."
                  @input="onSearchInput"
                />
              </div>
              <select
                v-model="filterStatus"
                class="form-select"
                @change="fetchPosts"
              >
                <option value="">All</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div v-if="listLoading" class="text-center py-4">
              <div class="spinner-border spinner-border-sm" role="status" />
            </div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 44px">
                      <input
                        type="checkbox"
                        v-model="selectAll"
                        @change="toggleAll"
                      />
                    </th>
                    <th style="width: 80px">Image</th>
                    <th>Title</th>
                    <th style="width: 80px">Views</th>
                    <th style="width: 105px">Date</th>
                    <th style="width: 105px">Status</th>
                    <th style="width: 90px">Sort</th>
                    <th style="width: 90px">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="pagedItems.length === 0">
                    <td colspan="8" class="empty-row">
                      <i class="bi bi-inbox" /><br />ยังไม่มีรายการ
                    </td>
                  </tr>
                  <tr
                    v-for="(item, index) in pagedItems"
                    :key="item.id"
                    class="table-row"
                    :class="{ selected: selectedIds.includes(item.id) }"
                  >
                    <td>
                      <input
                        type="checkbox"
                        :checked="selectedIds.includes(item.id)"
                        @change="toggleSelect(item.id)"
                      />
                    </td>
                    <td>
                      <div class="table-img-wrap">
                        <img
                          v-if="item.img"
                          :src="resolveImgUrl(item.img)"
                          :alt="item.title"
                        />
                        <div v-else class="table-img-empty">
                          <i class="bi bi-image" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="item-title">
                        {{ (page - 1) * perPage + index + 1 }} -
                        {{ item.title }}
                      </div>
                      <div class="item-excerpt">
                        {{ stripHtml(item.content) }}
                      </div>
                    </td>
                    <td>
                      <div class="views-cell">
                        <i class="bi bi-eye views-icon" />
                        {{ (item.total_views ?? 0).toLocaleString() }}
                      </div>
                    </td>
                    <td class="date-cell">{{ item.date }}</td>
                    <td>
                      <span class="status-chip" :class="item.status">{{
                        statusLabel(item.status)
                      }}</span>
                    </td>
                    <td>
                      <div class="action-btns">
                        <button
                          class="act-btn sort-btn"
                          :disabled="index === 0 && page === 1"
                          @click="moveItem(item, 'up')"
                        >
                          <i class="bi bi-chevron-up" />
                        </button>
                        <button
                          class="act-btn sort-btn"
                          :disabled="
                            index === pagedItems.length - 1 &&
                            page === totalPages
                          "
                          @click="moveItem(item, 'down')"
                        >
                          <i class="bi bi-chevron-down" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div class="action-btns">
                        <button class="act-btn edit" @click="openEdit(item)">
                          <i class="bi bi-pencil" />
                        </button>
                        <button
                          class="act-btn delete"
                          @click="confirmDelete(item)"
                        >
                          <i class="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="table-footer">
              <div v-if="selectedIds.length" class="bulk-actions">
                <span>เลือก {{ selectedIds.length }} รายการ</span>
                <button class="bulk-btn" @click="confirmDelete('all')">
                  ลบที่เลือก
                </button>
                <button class="bulk-btn" @click="bulkStatus('published')">
                  Published
                </button>
              </div>
              <div v-else class="pagination">
                <button
                  class="page-btn"
                  :disabled="page <= 1"
                  @click="prevPage"
                >
                  <i class="bi bi-chevron-left" />
                </button>
                <span class="page-info"
                  >หน้า {{ page }} / {{ totalPages }}</span
                >
                <button
                  class="page-btn"
                  :disabled="page >= totalPages"
                  @click="nextPage"
                >
                  <i class="bi bi-chevron-right" />
                </button>
                <select
                  v-model="perPage"
                  class="form-select"
                  style="width: auto"
                  @change="onLimitChange"
                >
                  <option :value="10">10 / หน้า</option>
                  <option :value="20">20 / หน้า</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div v-else class="view-wrap">
          <section class="section-card">
            <div class="section-head">
              <div>
                <h3 class="section-title">
                  {{ view === "create" ? "เพิ่มรายการใหม่" : "แก้ไข" }}
                </h3>
              </div>
              <button class="btn-outline" @click="view = 'list'">
                <i class="bi bi-arrow-left-short me-1" />Back
              </button>
            </div>
            <div class="form-layout">
              <div class="form-main">
                <div class="form-field">
                  <label>ชื่อ / Title <span class="req">*</span></label>
                  <input
                    v-model="editForm.title"
                    type="text"
                    placeholder="ชื่อบทความ..."
                    class="field-input"
                  />
                </div>
                <div class="form-field">
                  <label>Description</label>
                  <textarea
                    v-model="editForm.description"
                    placeholder="คำอธิบาย..."
                    class="field-input"
                    rows="2"
                  />
                </div>
                <div class="form-field">
                  <label>เนื้อหา / Content</label>
                  <div class="mg-toolbar">
                    <span class="mg-toolbar-label">Layout</span>
                    <button
                      class="mg-tool"
                      title="Text"
                      @click="addBlock('text')"
                    >
                      <i class="bi bi-text-paragraph" />
                    </button>
                    <button
                      class="mg-tool"
                      title="2 Columns"
                      @click="addBlock('two-col')"
                    >
                      <i class="bi bi-layout-split" />
                    </button>
                    <button
                      class="mg-tool"
                      title="Image Right"
                      @click="addBlock('img-right')"
                    >
                      <i class="bi bi-layout-text-sidebar-reverse" />
                    </button>
                    <button
                      class="mg-tool"
                      title="Image Left"
                      @click="addBlock('img-left')"
                    >
                      <i class="bi bi-layout-text-sidebar" />
                    </button>
                    <button
                      class="mg-tool"
                      title="Full Image"
                      @click="addBlock('img-full')"
                    >
                      <i class="bi bi-image" />
                    </button>
                    <button
                      class="mg-tool"
                      title="2 Images"
                      @click="addBlock('img-pair')"
                    >
                      <i class="bi bi-images" />
                    </button>
                    <!-- <button
                      class="mg-tool"
                      title="Quote"
                      @click="addBlock('quote')"
                    >
                      <i class="bi bi-chat-quote" />
                    </button> -->
                    <button
                      class="mg-tool"
                      title="Caption"
                      @click="addBlock('caption')"
                    >
                      <i class="bi bi-card-text" />
                    </button>
                  </div>
                  <div class="mg-blocks">
                    <div
                      v-if="editorBlocks.length === 0"
                      class="mg-empty"
                      @click="addBlock('text')"
                    >
                      <i class="bi bi-plus-circle" /><span
                        >คลิกเพื่อเพิ่ม block แรก</span
                      >
                    </div>
                    <div
                      v-for="(block, idx) in editorBlocks"
                      :key="block.id"
                      class="mg-block"
                      :class="{ 'mg-block-active': activeBlock === idx }"
                      @click="activeBlock = idx"
                    >
                      <div class="mg-ctrl">
                        <button
                          class="mg-ctrl-btn"
                          :disabled="idx === 0"
                          @click.stop="moveBlock(idx, -1)"
                        >
                          <i class="bi bi-chevron-up" />
                        </button>
                        <button
                          class="mg-ctrl-btn"
                          :disabled="idx === editorBlocks.length - 1"
                          @click.stop="moveBlock(idx, 1)"
                        >
                          <i class="bi bi-chevron-down" />
                        </button>
                        <button
                          class="mg-ctrl-btn mg-ctrl-danger"
                          @click.stop="removeBlock(idx)"
                        >
                          <i class="bi bi-trash3" />
                        </button>
                      </div>

                      <!-- ── TEXT ── -->
                      <div v-if="block.type === 'text'" class="mg-text-block">
                        <div class="mg-mini-bar">
                          <button
                            class="mg-mini-btn"
                            title="Align Left"
                            @click.stop="fmtBlock(idx, 'justifyLeft')"
                          >
                            <i class="bi bi-text-left" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            title="Align Center"
                            @click.stop="fmtBlock(idx, 'justifyCenter')"
                          >
                            <i class="bi bi-text-center" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            title="Align Right"
                            @click.stop="fmtBlock(idx, 'justifyRight')"
                          >
                            <i class="bi bi-text-right" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            @click.stop="fmtBlock(idx, 'bold')"
                          >
                            <i class="bi bi-type-bold" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            @click.stop="fmtBlock(idx, 'italic')"
                          >
                            <i class="bi bi-type-italic" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            @click.stop="fmtBlock(idx, 'underline')"
                          >
                            <i class="bi bi-type-underline" />
                          </button>
                          <div class="mg-mini-sep" />
                          <select
                            class="mg-mini-sel"
                            @change="
                              (e) =>
                                fmtBlock(idx, 'formatBlock', e.target.value)
                            "
                          >
                            <option value="p">Paragraph</option>
                            <option value="h2">H2</option>
                            <option value="h3">H3</option>
                            <option value="h4">H4</option>
                          </select>
                        </div>
                        <div
                          :ref="(el) => setEditorRef(el, idx)"
                          class="mg-editable"
                          contenteditable="true"
                          data-placeholder="เขียนเนื้อหา..."
                          @input="
                            (e) => {
                              block.content = e.target.innerHTML;
                              syncContent();
                            }
                          "
                        />
                      </div>

                      <!-- ── TWO-COL ── -->
                      <div
                        v-else-if="block.type === 'two-col'"
                        class="mg-two-col-editor"
                      >
                        <div class="mg-col-wrap">
                          <div class="mg-col-lbl">Column 1</div>
                          <div class="mg-mini-bar">
                            <button
                              class="mg-mini-btn"
                              title="Align Left"
                              @click.stop="
                                fmtColRef(idx, 'col1', 'justifyLeft')
                              "
                            >
                              <i class="bi bi-text-left" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              title="Align Center"
                              @click.stop="
                                fmtColRef(idx, 'col1', 'justifyCenter')
                              "
                            >
                              <i class="bi bi-text-center" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              title="Align Right"
                              @click.stop="
                                fmtColRef(idx, 'col1', 'justifyRight')
                              "
                            >
                              <i class="bi bi-text-right" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtColRef(idx, 'col1', 'bold')"
                            >
                              <i class="bi bi-type-bold" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtColRef(idx, 'col1', 'italic')"
                            >
                              <i class="bi bi-type-italic" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtColRef(idx, 'col1', 'underline')"
                            >
                              <i class="bi bi-type-underline" />
                            </button>
                          </div>
                          <div
                            :ref="(el) => setColRef(el, idx, 'col1')"
                            class="mg-editable"
                            contenteditable="true"
                            data-placeholder="คอลัมน์ซ้าย..."
                            @input="
                              (e) => {
                                block.col1 = e.target.innerHTML;
                                syncContent();
                              }
                            "
                          />
                        </div>
                        <div class="mg-col-wrap">
                          <div class="mg-col-lbl">Column 2</div>
                          <div class="mg-mini-bar">
                            <button
                              class="mg-mini-btn"
                              title="Align Left"
                              @click.stop="
                                fmtColRef(idx, 'col2', 'justifyLeft')
                              "
                            >
                              <i class="bi bi-text-left" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              title="Align Center"
                              @click.stop="
                                fmtColRef(idx, 'col2', 'justifyCenter')
                              "
                            >
                              <i class="bi bi-text-center" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              title="Align Right"
                              @click.stop="
                                fmtColRef(idx, 'col2', 'justifyRight')
                              "
                            >
                              <i class="bi bi-text-right" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtColRef(idx, 'col2', 'bold')"
                            >
                              <i class="bi bi-type-bold" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtColRef(idx, 'col2', 'italic')"
                            >
                              <i class="bi bi-type-italic" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtColRef(idx, 'col2', 'underline')"
                            >
                              <i class="bi bi-type-underline" />
                            </button>
                          </div>
                          <div
                            :ref="(el) => setColRef(el, idx, 'col2')"
                            class="mg-editable"
                            contenteditable="true"
                            data-placeholder="คอลัมน์ขวา..."
                            @input="
                              (e) => {
                                block.col2 = e.target.innerHTML;
                                syncContent();
                              }
                            "
                          />
                        </div>
                      </div>

                      <!-- ── IMG-RIGHT ── -->
                      <div
                        v-else-if="block.type === 'img-right'"
                        class="mg-side-editor mg-side-right"
                      >
                        <div class="mg-side-text-wrap">
                          <div class="mg-mini-bar">
                            <button
                              class="mg-mini-btn"
                              title="Align Left"
                              @click.stop="fmtSideRef(idx, 'justifyLeft')"
                            >
                              <i class="bi bi-text-left" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              title="Align Center"
                              @click.stop="fmtSideRef(idx, 'justifyCenter')"
                            >
                              <i class="bi bi-text-center" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              title="Align Right"
                              @click.stop="fmtSideRef(idx, 'justifyRight')"
                            >
                              <i class="bi bi-text-right" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtSideRef(idx, 'bold')"
                            >
                              <i class="bi bi-type-bold" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtSideRef(idx, 'italic')"
                            >
                              <i class="bi bi-type-italic" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtSideRef(idx, 'underline')"
                            >
                              <i class="bi bi-type-underline" />
                            </button>
                          </div>
                          <div
                            :ref="(el) => setSideRef(el, idx)"
                            class="mg-editable"
                            contenteditable="true"
                            data-placeholder="เขียนเนื้อหา..."
                            @input="
                              (e) => {
                                block.content = e.target.innerHTML;
                                syncContent();
                              }
                            "
                          />
                        </div>
                        <div
                          class="mg-side-img-wrap"
                          @click.stop="triggerBlockImg(idx)"
                        >
                          <img
                            v-if="block.img"
                            :src="resolveImgUrl(block.img)"
                          />
                          <div v-else class="mg-img-ph">
                            <i class="bi bi-image" />
                            <span v-if="block._uploading" class="mg-upload-hint"
                              >กำลังอัปโหลด...</span
                            >
                            <span v-else>Click to upload</span>
                          </div>
                          <input
                            v-if="block.img"
                            v-model="block.caption"
                            class="mg-caption-inp"
                            placeholder="Caption..."
                            @click.stop
                          />
                        </div>
                      </div>

                      <!-- ── IMG-LEFT ── -->
                      <div
                        v-else-if="block.type === 'img-left'"
                        class="mg-side-editor mg-side-left"
                      >
                        <div
                          class="mg-side-img-wrap"
                          @click.stop="triggerBlockImg(idx)"
                        >
                          <img
                            v-if="block.img"
                            :src="resolveImgUrl(block.img)"
                          />
                          <div v-else class="mg-img-ph">
                            <i class="bi bi-image" />
                            <span v-if="block._uploading" class="mg-upload-hint"
                              >กำลังอัปโหลด...</span
                            >
                            <span v-else>Click to upload</span>
                          </div>
                          <input
                            v-if="block.img"
                            v-model="block.caption"
                            class="mg-caption-inp"
                            placeholder="Caption..."
                            @click.stop
                          />
                        </div>
                        <div class="mg-side-text-wrap">
                          <div class="mg-mini-bar">
                            <button
                              class="mg-mini-btn"
                              title="Align Left"
                              @click.stop="fmtSideRef(idx, 'justifyLeft')"
                            >
                              <i class="bi bi-text-left" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              title="Align Center"
                              @click.stop="fmtSideRef(idx, 'justifyCenter')"
                            >
                              <i class="bi bi-text-center" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              title="Align Right"
                              @click.stop="fmtSideRef(idx, 'justifyRight')"
                            >
                              <i class="bi bi-text-right" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtSideRef(idx, 'bold')"
                            >
                              <i class="bi bi-type-bold" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtSideRef(idx, 'italic')"
                            >
                              <i class="bi bi-type-italic" />
                            </button>
                            <button
                              class="mg-mini-btn"
                              @click.stop="fmtSideRef(idx, 'underline')"
                            >
                              <i class="bi bi-type-underline" />
                            </button>
                          </div>
                          <div
                            :ref="(el) => setSideRef(el, idx)"
                            class="mg-editable"
                            contenteditable="true"
                            data-placeholder="เขียนเนื้อหา..."
                            @input="
                              (e) => {
                                block.content = e.target.innerHTML;
                                syncContent();
                              }
                            "
                          />
                        </div>
                      </div>

                      <!-- ── IMG-FULL ── -->
                      <div
                        v-else-if="block.type === 'img-full'"
                        class="mg-full-img-wrap"
                        @click.stop="triggerBlockImg(idx)"
                      >
                        <img v-if="block.img" :src="resolveImgUrl(block.img)" />
                        <div v-else class="mg-img-ph mg-img-ph-full">
                          <i class="bi bi-image" />
                          <span v-if="block._uploading" class="mg-upload-hint"
                            >กำลังอัปโหลด...</span
                          >
                          <span v-else>Click to upload full width image</span>
                        </div>
                        <input
                          v-if="block.img"
                          v-model="block.caption"
                          class="mg-caption-inp"
                          placeholder="Caption..."
                          @click.stop
                        />
                      </div>

                      <!-- ── IMG-PAIR ── -->
                      <div
                        v-else-if="block.type === 'img-pair'"
                        class="mg-img-pair-editor"
                      >
                        <div class="mg-img-pair-grid">
                          <div class="mg-pair-slot">
                            <div class="mg-col-lbl">Image 1</div>
                            <div
                              class="mg-side-img-wrap"
                              @click.stop="triggerPairImg(idx, 1)"
                            >
                              <img
                                v-if="block.img1"
                                :src="resolveImgUrl(block.img1)"
                              />
                              <div v-else class="mg-img-ph">
                                <i class="bi bi-image" />
                                <span
                                  v-if="block._uploading1"
                                  class="mg-upload-hint"
                                  >กำลังอัปโหลด...</span
                                >
                                <span v-else>Click to upload</span>
                              </div>
                              <input
                                v-if="block.img1"
                                v-model="block.caption1"
                                class="mg-caption-inp"
                                placeholder="Caption..."
                                @click.stop
                              />
                            </div>
                          </div>
                          <div class="mg-pair-slot">
                            <div class="mg-col-lbl">Image 2</div>
                            <div
                              class="mg-side-img-wrap"
                              @click.stop="triggerPairImg(idx, 2)"
                            >
                              <img
                                v-if="block.img2"
                                :src="resolveImgUrl(block.img2)"
                              />
                              <div v-else class="mg-img-ph">
                                <i class="bi bi-image" />
                                <span
                                  v-if="block._uploading2"
                                  class="mg-upload-hint"
                                  >กำลังอัปโหลด...</span
                                >
                                <span v-else>Click to upload</span>
                              </div>
                              <input
                                v-if="block.img2"
                                v-model="block.caption2"
                                class="mg-caption-inp"
                                placeholder="Caption..."
                                @click.stop
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- ── QUOTE ── -->
                      <div
                        v-else-if="block.type === 'quote'"
                        class="mg-quote-block"
                      >
                        <div class="mg-mini-bar">
                          <button
                            class="mg-mini-btn"
                            title="Align Left"
                            @click.stop="fmtQuoteRef(idx, 'justifyLeft')"
                          >
                            <i class="bi bi-text-left" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            title="Align Center"
                            @click.stop="fmtQuoteRef(idx, 'justifyCenter')"
                          >
                            <i class="bi bi-text-center" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            title="Align Right"
                            @click.stop="fmtQuoteRef(idx, 'justifyRight')"
                          >
                            <i class="bi bi-text-right" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            @click.stop="fmtQuoteRef(idx, 'bold')"
                          >
                            <i class="bi bi-type-bold" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            @click.stop="fmtQuoteRef(idx, 'italic')"
                          >
                            <i class="bi bi-type-italic" />
                          </button>
                          <button
                            class="mg-mini-btn"
                            @click.stop="fmtQuoteRef(idx, 'underline')"
                          >
                            <i class="bi bi-type-underline" />
                          </button>
                        </div>
                        <div
                          :ref="(el) => setQuoteRef(el, idx)"
                          class="mg-quote-text"
                          contenteditable="true"
                          data-placeholder="คำพูด / Quote..."
                          @input="
                            (e) => {
                              block.content = e.target.innerHTML;
                              syncContent();
                            }
                          "
                        />
                        <input
                          v-model="block.author"
                          class="mg-quote-author"
                          placeholder="— Author (optional)"
                          @click.stop
                        />
                      </div>

                      <!-- ── CAPTION ── -->
                      <div
                        v-else-if="block.type === 'caption'"
                        class="mg-caption-block-editor"
                      >
                        <textarea
                          v-model="block.content"
                          class="mg-caption-field"
                          placeholder="Caption text..."
                          rows="2"
                          @click.stop
                          @input="autoResize($event)"
                        />
                      </div>
                    </div>
                  </div>
                  <input
                    ref="blockImgInput"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    @change="onBlockImgChange"
                  />
                  <input
                    ref="pairImgInput"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    @change="onPairImgChange"
                  />
                </div>
              </div>
              <div class="form-side">
                <div class="side-box">
                  <div class="side-box-title">
                    รูปภาพหลัก
                    <span v-if="imgUploading" class="upload-badge"
                      >กำลังอัปโหลด...</span
                    >
                  </div>
                  <div
                    class="img-dropzone"
                    @click="triggerItemImg"
                    @dragover.prevent
                    @drop.prevent="onItemImgDrop"
                  >
                    <img
                      v-if="editForm.img"
                      :src="resolveImgUrl(editForm.img)"
                      class="img-preview"
                    />
                    <div v-else-if="imgUploading" class="img-placeholder">
                      <div
                        class="spinner-border spinner-border-sm"
                        role="status"
                      />
                      <span>กำลังอัปโหลด...</span>
                    </div>
                    <div v-else class="img-placeholder">
                      <i class="bi bi-image" /><span>คลิกหรือลากไฟล์</span>
                    </div>
                  </div>
                  <input
                    ref="itemImgInput"
                    type="file"
                    accept="image/*"
                    class="d-none"
                    @change="onItemImgChange"
                  />
                  <button v-if="editForm.img" class="remove-img-btn">
                    <i class="bi bi-trash3" @click="editForm.img = null" />
                  </button>
                </div>
                <div class="side-box">
                  <div class="side-box-title">โพสต์</div>
                  <div class="form-field">
                    <label>สถานะการแสดงผล</label>
                    <select v-model="editForm.status" class="form-select">
                      <option value="published">Published</option>
                      <option value="unpublished">Unpublished</option>
                    </select>
                  </div>
                  <div class="form-field">
                    <label>วันที่</label>
                    <input
                      v-model="editForm.date"
                      type="date"
                      class="field-input"
                    />
                  </div>
                  <div class="side-actions mt-3">
                    <button
                      class="btn-primary btn sm px-3 py-2 w-100"
                      :disabled="saveLoading || imgUploading"
                      @click="saveItem"
                    >
                      <span
                        v-if="saveLoading"
                        class="spinner-border spinner-border-sm me-1"
                      />
                      {{ view === "create" ? "Create" : "Update" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </template>

      <!-- ───── ADS PAGE ───── -->
      <div v-if="currentPage === 'ads'" class="view-wrap">
        <AdsBannerPage
          :posts-api="postsApi"
          :ads-api="adsApi"
          :show-toast="showToast"
        />
      </div>

      <!-- ───── CONTACT PAGE ───── -->
      <div v-if="currentPage === 'contact'" class="view-wrap">
        <ContactPage :contact-api="contactApi" :show-toast="showToast" />
      </div>
    </main>

    <!-- DELETE MODAL -->
    <DeleteModal
      v-if="deleteTarget"
      :target="deleteTarget"
      @cancel="deleteTarget = null"
      @confirm="checkDelete"
    />

    <!-- TOAST -->
    <Toast :toast="toast" />
  </div>
</template>

<script setup>
useHead({ title: "Dashboard - KIN'S" });

import { ref, reactive, computed, watch, nextTick } from "vue";
import Dashboard from "../../components/Dashboard.vue";

definePageMeta({ middleware: "bo-auth" });

const router = useRouter();
const {
  auth,
  posts: postsApi,
  banners: bannersApi,
  dashboard: dashboardApi,
  contact: contactApi,
  ads: adsApi,
} = useApi();

const {
  public: { apiBase = "http://localhost:3002/api" },
} = useRuntimeConfig();
const API_BASE = apiBase.replace(/\/api\/?$/, "");

// ── Nav ──────────────────────────────────────────────
const sidebarCollapsed = ref(false);
const activeSection = ref("hotels");
const navItems = [
  { key: "hotels", label: "Hotels", icon: "bi-building" },
  { key: "realestate", label: "Real Estate", icon: "bi-house-door" },
  { key: "travel", label: "Travel", icon: "bi-airplane" },
  { key: "lifestyle", label: "Lifestyle", icon: "bi-stars" },
];
const currentNav = computed(() =>
  navItems.find((n) => n.key === activeSection.value),
);
const sectionCount = reactive({
  hotels: 0,
  realestate: 0,
  travel: 0,
  lifestyle: 0,
});
const currentPage = ref("dashboard");

function handlePage(page) {
  currentPage.value = page;
}

async function switchSection(key) {
  currentPage.value = "content";
  activeSection.value = key;
  view.value = "list";
  search.value = "";
  filterStatus.value = "";
  selectedIds.value = [];
  selectAll.value = false;
  page.value = 1;
  await Promise.all([fetchPosts(), fetchBanners()]);
}

// ── Image URL helpers ────────────────────────────────
function resolveImgUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}
function resolveBannerUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}
async function uploadImageFile(file) {
  return postsApi.uploadImage(activeSection.value, file);
}

// ── Posts ────────────────────────────────────────────
const pagedItems = ref([]);
const meta = ref({ total: 0, page: 1, limit: 8, totalPages: 1 });
const listLoading = ref(false);
const saveLoading = ref(false);
const search = ref("");
const filterStatus = ref("");
const page = ref(1);
const perPage = ref(10);
const isSpinning = ref(false);
const totalPages = computed(() => meta.value.totalPages ?? 1);

let searchTimer = null;
function onSearchInput() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    page.value = 1;
    fetchPosts();
  }, 400);
}
function onLimitChange() {
  page.value = 1;
  fetchPosts();
}

async function moveItem(item, direction) {
  try {
    await postsApi.move(activeSection.value, item.id, direction);
    await fetchPosts();
  } catch (e) {
    showToast(e.message || "เรียงลำดับไม่สำเร็จ", "error");
  }
}

async function fetchPosts() {
  listLoading.value = true;
  isSpinning.value = true;
  try {
    const params = { page: page.value, limit: perPage.value };
    if (search.value) params.search = search.value;
    if (filterStatus.value) params.status = filterStatus.value;
    const res = await postsApi.list(activeSection.value, params);
    pagedItems.value = res.data;
    meta.value = res.meta;
    sectionCount[activeSection.value] = res.meta.total;
  } catch (e) {
    showToast(e.message || "โหลดข้อมูลไม่ได้", "error");
  } finally {
    listLoading.value = false;
    setTimeout(() => {
      isSpinning.value = false;
    }, 500);
  }
}
function prevPage() {
  if (page.value > 1) {
    page.value--;
    fetchPosts();
  }
}
function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    fetchPosts();
  }
}

async function fetchAllSectionCounts() {
  for (const item of navItems.filter((n) => n.key !== activeSection.value)) {
    try {
      const res = await postsApi.list(item.key, { page: 1, limit: 1 });
      sectionCount[item.key] = res.meta.total;
    } catch {}
  }
}

// ── Banners ──────────────────────────────────────────
const bannersBySection = reactive({
  hotels: [],
  realestate: [],
  travel: [],
  lifestyle: [],
});
const currentBanners = computed(() => bannersBySection[activeSection.value]);
const isDragOver = ref(false);
const fileInput = ref(null);

async function fetchBanners() {
  try {
    const res = await bannersApi.list(activeSection.value);
    bannersBySection[activeSection.value] = res.data;
  } catch (e) {
    console.error("banner fetch error", e);
  }
}
function triggerUpload() {
  fileInput.value?.click();
}
async function onFileChange(e) {
  const f = e.target.files[0];
  if (f) await uploadBanner(f);
  e.target.value = "";
}
async function onDrop(e) {
  isDragOver.value = false;
  const f = e.dataTransfer.files[0];
  if (f) await uploadBanner(f);
}
async function uploadBanner(file) {
  try {
    await bannersApi.upload(activeSection.value, file);
    await fetchBanners();
    showToast("อัพโหลด banner แล้ว");
  } catch (e) {
    showToast(e.message || "อัพโหลดไม่ได้", "error");
  }
}
async function removeBanner(banner) {
  try {
    await bannersApi.delete(activeSection.value, banner.id);
    await fetchBanners();
    showToast("ลบ banner แล้ว");
  } catch (e) {
    showToast(e.message || "ลบไม่ได้", "error");
  }
}

// ── Selection ────────────────────────────────────────
const selectedIds = ref([]);
const selectAll = ref(false);
function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id);
  idx === -1 ? selectedIds.value.push(id) : selectedIds.value.splice(idx, 1);
}
function toggleAll(e) {
  selectedIds.value = e.target.checked ? pagedItems.value.map((i) => i.id) : [];
}
async function bulkDelete() {
  try {
    await postsApi.bulkDelete(activeSection.value, selectedIds.value);
    selectedIds.value = [];
    selectAll.value = false;
    deleteTarget.value = null;
    showToast("ลบรายการที่เลือกแล้ว");
    await fetchPosts();
  } catch (e) {
    showToast(e.message, "error");
  }
}
async function bulkStatus(status) {
  try {
    await postsApi.bulkStatus(activeSection.value, selectedIds.value, status);
    selectedIds.value = [];
    selectAll.value = false;
    showToast("อัพเดทสถานะแล้ว");
    await fetchPosts();
  } catch (e) {
    showToast(e.message, "error");
  }
}

// ── Magazine Editor ──────────────────────────────────
const editorBlocks = ref([]);
const activeBlock = ref(null);
const blockImgInput = ref(null);
const pendingImgIdx = ref(null);
const editorRefs = ref({}); // text blocks
const colRefs = ref({}); // two-col: key = `${idx}-col1` / `${idx}-col2`
const sideRefs = ref({}); // img-right / img-left
const quoteRefs = ref({}); // quote

// ── pair image ───────────────────────────────────────
const pairImgInput = ref(null);
const pendingPairIdx = ref(null);
const pendingPairSlot = ref(null);

function triggerPairImg(idx, slot) {
  pendingPairIdx.value = idx;
  pendingPairSlot.value = slot;
  pairImgInput.value?.click();
}
async function onPairImgChange(e) {
  const file = e.target.files[0];
  if (!file || pendingPairIdx.value === null) return;
  e.target.value = "";
  const idx = pendingPairIdx.value;
  const slot = pendingPairSlot.value;
  const uploadKey = `_uploading${slot}`;
  const imgKey = `img${slot}`;
  editorBlocks.value[idx][uploadKey] = true;
  try {
    editorBlocks.value[idx][imgKey] = await uploadImageFile(file);
    syncContent();
  } catch (err) {
    showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    editorBlocks.value[idx][uploadKey] = false;
  }
}

// ── ref setters ──────────────────────────────────────
function setEditorRef(el, idx) {
  if (!el) return;
  editorRefs.value[idx] = el;
  if (el.innerHTML !== (editorBlocks.value[idx]?.content || ""))
    el.innerHTML = editorBlocks.value[idx]?.content || "";
}
function setColRef(el, idx, col) {
  if (!el) return;
  colRefs.value[`${idx}-${col}`] = el;
  const val = editorBlocks.value[idx]?.[col] || "";
  if (el.innerHTML !== val) el.innerHTML = val;
}
function setSideRef(el, idx) {
  if (!el) return;
  sideRefs.value[idx] = el;
  const val = editorBlocks.value[idx]?.content || "";
  if (el.innerHTML !== val) el.innerHTML = val;
}
function setQuoteRef(el, idx) {
  if (!el) return;
  quoteRefs.value[idx] = el;
  const val = editorBlocks.value[idx]?.content || "";
  if (el.innerHTML !== val) el.innerHTML = val;
}

// ── format helpers ───────────────────────────────────
function fmtBlock(idx, cmd, val) {
  const el = editorRefs.value[idx];
  if (!el) return;
  el.focus();
  document.execCommand(cmd, false, val || null);
  editorBlocks.value[idx].content = el.innerHTML;
  syncContent();
}
function fmtColRef(idx, col, cmd, val) {
  const el = colRefs.value[`${idx}-${col}`];
  if (!el) return;
  el.focus();
  document.execCommand(cmd, false, val || null);
  editorBlocks.value[idx][col] = el.innerHTML;
  syncContent();
}
function fmtSideRef(idx, cmd, val) {
  const el = sideRefs.value[idx];
  if (!el) return;
  el.focus();
  document.execCommand(cmd, false, val || null);
  editorBlocks.value[idx].content = el.innerHTML;
  syncContent();
}
function fmtQuoteRef(idx, cmd, val) {
  const el = quoteRefs.value[idx];
  if (!el) return;
  el.focus();
  document.execCommand(cmd, false, val || null);
  editorBlocks.value[idx].content = el.innerHTML;
  syncContent();
}

// ── block management ─────────────────────────────────
const blockDefaults = {
  text: () => ({ type: "text", content: "" }),
  "two-col": () => ({ type: "two-col", col1: "", col2: "" }),
  "img-right": () => ({
    type: "img-right",
    content: "",
    img: null,
    caption: "",
  }),
  "img-left": () => ({ type: "img-left", content: "", img: null, caption: "" }),
  "img-full": () => ({ type: "img-full", img: null, caption: "" }),
  "img-pair": () => ({
    type: "img-pair",
    img1: null,
    img2: null,
    caption1: "",
    caption2: "",
  }),
  quote: () => ({ type: "quote", content: "", author: "" }),
  caption: () => ({ type: "caption", content: "" }),
};
function addBlock(type) {
  editorBlocks.value.push({ id: Date.now(), ...blockDefaults[type]() });
  activeBlock.value = editorBlocks.value.length - 1;
  syncContent();
}
function removeBlock(idx) {
  editorBlocks.value.splice(idx, 1);
  activeBlock.value = null;
  syncContent();
}
function moveBlock(idx, dir) {
  const t = idx + dir;
  if (t < 0 || t >= editorBlocks.value.length) return;
  [editorBlocks.value[idx], editorBlocks.value[t]] = [
    editorBlocks.value[t],
    editorBlocks.value[idx],
  ];
  activeBlock.value = t;
  syncContent();
}
function triggerBlockImg(idx) {
  pendingImgIdx.value = idx;
  blockImgInput.value?.click();
}
async function onBlockImgChange(e) {
  const file = e.target.files[0];
  if (!file || pendingImgIdx.value === null) return;
  e.target.value = "";
  const idx = pendingImgIdx.value;
  editorBlocks.value[idx]._uploading = true;
  try {
    editorBlocks.value[idx].img = await uploadImageFile(file);
    syncContent();
  } catch (err) {
    showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    editorBlocks.value[idx]._uploading = false;
  }
}

// ── serialize / deserialize ──────────────────────────
function deserializeBlocks(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks = [];
  Array.from(doc.body.children).forEach((el) => {
    if (el.classList.contains("mg-text")) {
      blocks.push({
        id: Date.now() + Math.random(),
        type: "text",
        content: el.innerHTML,
      });
    } else if (el.classList.contains("mg-two-col")) {
      const cols = el.querySelectorAll(".mg-col");
      blocks.push({
        id: Date.now() + Math.random(),
        type: "two-col",
        col1: cols[0]?.innerHTML || "",
        col2: cols[1]?.innerHTML || "",
      });
    } else if (el.classList.contains("mg-img-right")) {
      blocks.push({
        id: Date.now() + Math.random(),
        type: "img-right",
        content: el.querySelector(".mg-side-text")?.innerHTML || "",
        img: el.querySelector("img")?.getAttribute("src") || null,
        caption: el.querySelector(".mg-caption")?.textContent || "",
      });
    } else if (el.classList.contains("mg-img-left")) {
      blocks.push({
        id: Date.now() + Math.random(),
        type: "img-left",
        content: el.querySelector(".mg-side-text")?.innerHTML || "",
        img: el.querySelector("img")?.getAttribute("src") || null,
        caption: el.querySelector(".mg-caption")?.textContent || "",
      });
    } else if (el.classList.contains("mg-img-full")) {
      blocks.push({
        id: Date.now() + Math.random(),
        type: "img-full",
        img: el.querySelector("img")?.getAttribute("src") || null,
        caption: el.querySelector(".mg-caption")?.textContent || "",
      });
    } else if (el.classList.contains("mg-img-pair")) {
      const imgs = el.querySelectorAll("img");
      const caps = el.querySelectorAll(".mg-caption");
      blocks.push({
        id: Date.now() + Math.random(),
        type: "img-pair",
        img1: imgs[0]?.getAttribute("src") || null,
        img2: imgs[1]?.getAttribute("src") || null,
        caption1: caps[0]?.textContent || "",
        caption2: caps[1]?.textContent || "",
      });
    } else if (
      el.tagName === "BLOCKQUOTE" &&
      el.classList.contains("mg-quote")
    ) {
      blocks.push({
        id: Date.now() + Math.random(),
        type: "quote",
        content: el.querySelector("p")?.innerHTML || "",
        author: el.querySelector("cite")?.textContent || "",
      });
    } else if (el.classList.contains("mg-caption-block")) {
      blocks.push({
        id: Date.now() + Math.random(),
        type: "caption",
        content: el.innerHTML.replace(/<br\s*\/?>/gi, "\n") || "",
      });
    }
  });
  return blocks;
}
function serializeBlocks() {
  return editorBlocks.value
    .map((b) => {
      switch (b.type) {
        case "text":
          return `<div class="mg-text">${b.content}</div>`;
        case "two-col":
          return `<div class="mg-two-col"><div class="mg-col">${b.col1}</div><div class="mg-col">${b.col2}</div></div>`;
        case "img-right":
          return `<div class="mg-img-right"><div class="mg-side-text">${b.content}</div><div class="mg-side-img"><img src="${b.img || ""}"/>${b.caption ? `<p class="mg-caption">${b.caption}</p>` : ""}</div></div>`;
        case "img-left":
          return `<div class="mg-img-left"><div class="mg-side-img"><img src="${b.img || ""}"/>${b.caption ? `<p class="mg-caption">${b.caption}</p>` : ""}</div><div class="mg-side-text">${b.content}</div></div>`;
        case "img-full":
          return `<div class="mg-img-full"><img src="${b.img || ""}"/>${b.caption ? `<p class="mg-caption">${b.caption}</p>` : ""}</div>`;
        case "img-pair":
          return `<div class="mg-img-pair"><div class="mg-pair-img"><img src="${b.img1 || ""}"/>${b.caption1 ? `<p class="mg-caption">${b.caption1}</p>` : ""}</div><div class="mg-pair-img"><img src="${b.img2 || ""}"/>${b.caption2 ? `<p class="mg-caption">${b.caption2}</p>` : ""}</div></div>`;
        case "quote":
          return `<blockquote class="mg-quote"><p>${b.content}</p>${b.author ? `<cite>${b.author}</cite>` : ""}</blockquote>`;
        case "caption":
          return `<p class="mg-caption-block">${b.content.replace(/\n/g, "<br>")}</p>`;
        default:
          return "";
      }
    })
    .join("\n");
}
function syncContent() {
  editForm.content = serializeBlocks();
}
watch(editorBlocks, () => syncContent(), { deep: true });

// ── View & Form ──────────────────────────────────────
const view = ref("list");
const itemImgInput = ref(null);
const imgUploading = ref(false);

const blankForm = () => ({
  id: null,
  title: "",
  description: "",
  content: "",
  img: null,
  status: "published",
  date: new Date().toISOString().slice(0, 10),
});
const editForm = reactive(blankForm());

function openCreate() {
  Object.assign(editForm, blankForm());
  editorBlocks.value = [];
  activeBlock.value = null;
  view.value = "create";
}
function openEdit(item) {
  Object.assign(editForm, JSON.parse(JSON.stringify(item)));
  editorBlocks.value = deserializeBlocks(item.content);
  view.value = "edit";
  nextTick(() => {
    document.querySelectorAll(".mg-caption-field").forEach((el) => {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    });
  });
}

async function saveItem() {
  if (!editForm.title.trim()) {
    showToast("กรุณากรอกข้อมูล", "error");
    return;
  }
  if (!editForm.img) {
    showToast("กรุณาอัปโหลดรูปภาพ", "error");
    return;
  }
  if (imgUploading.value) {
    showToast("รอรูปอัปโหลดเสร็จก่อน", "error");
    return;
  }
  saveLoading.value = true;
  try {
    const payload = {
      title: editForm.title,
      description: editForm.description,
      content: editForm.content,
      img: editForm.img,
      status: editForm.status,
      date: editForm.date,
    };
    if (view.value === "create") {
      await postsApi.create(activeSection.value, payload);
      showToast("เพิ่มรายการใหม่แล้ว");
    } else {
      await postsApi.update(activeSection.value, editForm.id, payload);
      showToast("อัพเดทเรียบร้อยแล้ว");
    }
    view.value = "list";
    await fetchPosts();
  } catch (e) {
    showToast(e.message || "บันทึกไม่ได้", "error");
  } finally {
    saveLoading.value = false;
  }
}

function autoResize(e) {
  const el = e.target;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}
function triggerItemImg() {
  itemImgInput.value?.click();
}

async function onItemImgChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = "";
  imgUploading.value = true;
  try {
    editForm.img = await uploadImageFile(file);
  } catch (err) {
    showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    imgUploading.value = false;
  }
}
async function onItemImgDrop(e) {
  const file = e.dataTransfer.files[0];
  if (!file?.type.startsWith("image/")) return;
  imgUploading.value = true;
  try {
    editForm.img = await uploadImageFile(file);
  } catch (err) {
    showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    imgUploading.value = false;
  }
}

// ── Delete ───────────────────────────────────────────
const deleteTarget = ref(null);
function confirmDelete(item) {
  deleteTarget.value = item;
}
function checkDelete() {
  deleteTarget.value === "all" ? bulkDelete() : doDelete();
}
async function doDelete() {
  try {
    await postsApi.delete(activeSection.value, deleteTarget.value.id);
    deleteTarget.value = null;
    selectedIds.value = [];
    showToast("ลบรายการแล้ว");
    await fetchPosts();
  } catch (e) {
    showToast(e.message, "error");
  }
}

function stripHtml(html) {
  const t = (html || "").replace(/<[^>]*>/g, "");
  return t.length > 75 ? t.slice(0, 75) + "..." : t;
}
function statusLabel(s) {
  return { published: "Published", unpublished: "Unpublished" }[s] || s;
}

// ── Toast ────────────────────────────────────────────
const toast = reactive({ show: false, msg: "", type: "success" });
function showToast(msg, type = "success") {
  Object.assign(toast, { msg, type, show: true });
  setTimeout(() => {
    toast.show = false;
  }, 3000);
}

async function handleLogout() {
  await auth.logout();
  router.push("/admin");
}

// ── Init ─────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([fetchPosts()]);
  fetchAllSectionCounts();
});
</script>

<style scoped>
.dashboard {
  background: #f0f0ec;
  color: #1c1b18;
  display: flex;
  min-height: 100vh;
}

.views-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
}
.views-icon {
  font-size: 12px;
  color: var(--muted);
}

.sidebar {
  width: var(--sw);
  background: var(--ink);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 50;
  transition: width 0.25s ease;
  overflow: hidden;
}
.sidebar.collapsed {
  width: var(--sc);
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 64px;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  white-space: nowrap;
}
.logo-text {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.main-content {
  flex: 1;
  margin-left: var(--sw);
  transition: margin-left 0.25s;
  min-height: 100vh;
  padding-bottom: 56px;
  display: flex;
  flex-direction: column;
}
.topbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 26px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;
}
.breadcrumb {
  display: flex;
  list-style: none;
  gap: 0;
  font-size: 12px;
  padding: 0;
}
.breadcrumb-item a {
  color: var(--muted);
  text-decoration: none;
}
.breadcrumb-item a:hover {
  color: var(--accent);
}
.breadcrumb-item.active {
  color: var(--accent);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.avatar-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}
.avatar {
  width: 34px;
  height: 34px;
  background: var(--accent);
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  display: block;
}
.d-none {
  display: none;
}

.list-filters {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 7px 12px;
  background: #fff;
  flex: 1;
  min-width: 80%;
}
.search-wrap .bi {
  color: var(--muted);
  font-size: 13px;
}
.search-wrap input {
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink);
  width: 100%;
  background: transparent;
}

.item-title {
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 3px;
  line-height: 1.3;
}
.item-excerpt {
  font-size: 12px;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
.date-cell {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 0 0;
}
.bulk-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.bulk-btn {
  border: 1px solid var(--border);
  background: #fff;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
}
.bulk-btn:hover {
  border-color: var(--ink);
}
.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-info {
  font-size: 12.5px;
  color: var(--muted);
  white-space: nowrap;
}

.upload-badge {
  font-size: 10px;
  color: var(--accent);
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}
.side-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.img-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── MAGAZINE EDITOR ── */
.mg-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  border: 1px solid var(--border);
  border-radius: 8px 8px 0 0;
  padding: 8px 12px;
  background: #f9f9f7;
  z-index: 99;
  position: sticky;
  top: 60px;
}
.mg-toolbar-label {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--muted);
  margin-right: 4px;
}
.mg-tool {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  transition: background 0.15s;
}
.mg-tool:hover {
  background: var(--border);
}

.mg-blocks {
  border: 1px solid var(--border);
  border-radius: 0 0 8px 8px;
  border-top: none;
  background: #fff;
  min-height: 400px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 200px;
  color: var(--muted);
  cursor: pointer;
  border: 1.5px dashed var(--border);
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.2s;
}
.mg-empty:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.mg-block {
  position: relative;
  border: 1.5px solid transparent;
  border-radius: 6px;
  padding: 6px;
  transition: border-color 0.2s;
  max-width: 100%;
  overflow: hidden;
}
.mg-block:hover {
  border-color: var(--border);
}
.mg-block-active {
  border-color: var(--accent) !important;
}

.mg-ctrl {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 3px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.15s;
}
.mg-block:hover .mg-ctrl,
.mg-block-active .mg-ctrl {
  opacity: 1;
}

.mg-ctrl-btn {
  width: 24px;
  height: 24px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.mg-ctrl-btn:hover {
  border-color: var(--ink);
  color: var(--ink);
}
.mg-ctrl-btn:disabled {
  opacity: 0.3;
  pointer-events: none;
}
.mg-ctrl-danger:hover {
  border-color: var(--danger) !important;
  color: var(--danger) !important;
}

.mg-text-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mg-mini-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: #f4f4f2;
  border-radius: 4px;
  margin-bottom: 4px;
}
.mg-mini-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 3px;
  cursor: pointer;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}
.mg-mini-btn:hover {
  background: var(--border);
}
.mg-mini-sep {
  width: 1px;
  background: var(--border);
  margin: 2px 3px;
  align-self: stretch;
}
.mg-mini-sel {
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 2px 5px;
  font-size: 11px;
  background: #fff;
  color: var(--ink);
}

.mg-editable {
  min-height: 80px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--ink);
  outline: none;
  background: #fff;
  cursor: text;
  word-break: break-word;
  overflow-wrap: break-word;
}
.mg-editable:focus {
  border-color: var(--accent);
}
.mg-editable:empty::before {
  content: attr(data-placeholder);
  color: #bbb;
  pointer-events: none;
}

.mg-two-col-editor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.mg-col-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mg-col-lbl {
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--muted);
}

.mg-side-editor {
  display: grid;
  gap: 18px;
  align-items: start;
}
.mg-side-right,
.mg-side-left {
  grid-template-columns: 1fr 1fr;
}
.mg-side-text-wrap {
  display: flex;
  flex-direction: column;
}
.mg-side-img-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}
.mg-side-img-wrap img {
  width: 100%;
  border-radius: 4px;
  display: block;
  object-fit: cover;
}

.mg-full-img-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}
.mg-full-img-wrap img {
  width: 100%;
  border-radius: 4px;
  display: block;
}

.mg-img-ph {
  aspect-ratio: 4/3;
  border: 1.5px dashed var(--border);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  transition: border-color 0.2s;
}
.mg-img-ph:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.mg-img-ph .bi {
  font-size: 22px;
}
.mg-img-ph-full {
  aspect-ratio: 21/9;
}
.mg-upload-hint {
  font-size: 11px;
  color: var(--accent);
}

.mg-caption-inp {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--border);
  font-size: 11.5px;
  color: var(--muted);
  padding: 4px 0;
  background: transparent;
  outline: none;
  font-style: italic;
}
.mg-caption-inp::placeholder {
  color: #ccc;
}

.mg-quote-block {
  border-left: 3px solid var(--ink);
  padding: 14px 18px;
  background: #f9f9f7;
  border-radius: 0 6px 6px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mg-quote-text {
  font-size: 17px;
  font-style: italic;
  line-height: 1.6;
  color: var(--ink);
  outline: none;
  cursor: text;
  min-height: 40px;
}
.mg-quote-text:empty::before {
  content: attr(data-placeholder);
  color: #bbb;
  pointer-events: none;
}
.mg-quote-author {
  border: none;
  background: transparent;
  outline: none;
  font-size: 12px;
  color: var(--muted);
}

.mg-caption-block-editor {
  padding: 4px 0;
}
.mg-caption-field {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--border);
  font-size: 11.5px;
  color: var(--muted);
  padding: 6px 0;
  background: transparent;
  outline: none;
  font-style: italic;
  resize: none;
  overflow: hidden;
  min-height: 28px;
  font-family: inherit;
  line-height: 1.6;
}

.mg-img-pair-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mg-img-pair-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.mg-pair-slot {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

@media (max-width: 1100px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: var(--sc) !important;
  }
  .sidebar .logo-text,
  .sidebar .nav-label,
  .sidebar .nav-badge,
  .sidebar .nav-group-label {
    display: none;
  }
  .main-content {
    margin-left: var(--sc) !important;
    width: calc(100% - var(--sc));
    padding-bottom: 14px;
  }
  .form-layout {
    grid-template-columns: 1fr;
  }
  .list-filters {
    flex-direction: column;
  }
  .item-title {
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  .search-wrap {
    min-width: 100%;
  }
  .topbar {
    padding: 0 12px;
  }
  .mg-two-col-editor,
  .mg-side-right,
  .mg-side-left,
  .mg-img-pair-grid {
    grid-template-columns: 1fr;
  }
  .contact-row {
    flex-wrap: wrap;
  }
  .item-excerpt {
    display: none;
  }
}
</style>
