<template>
  <div class="view-wrap">
    <section class="section-card">
      <div class="section-head">
        <div>
          <h3 class="section-title">
            {{ view === "create" ? "เพิ่มรายการใหม่" : "แก้ไข" }}
          </h3>
        </div>
        <button class="btn-outline" @click="$emit('back')">
          <i class="bi bi-arrow-left-short me-1" />Back
        </button>
      </div>
      <div class="form-layout">
        <div class="form-main">
          <div class="form-field">
            <label>ชื่อ / Title <span class="req">*</span></label>
            <input
              v-model="form.title"
              type="text"
              placeholder="ชื่อบทความ..."
              class="field-input"
            />
          </div>
          <div class="form-field">
            <label>Description</label>
            <textarea
              v-model="form.description"
              placeholder="คำอธิบาย..."
              class="field-input"
              rows="2"
            />
          </div>
          <div class="form-field">
            <label>เนื้อหา / Content</label>
            <div class="mg-toolbar">
              <span class="mg-toolbar-label">Layout</span>
              <button class="mg-tool" title="Text" @click="addBlock('text')">
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

                <!-- TEXT -->
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
                        (e) => fmtBlock(idx, 'formatBlock', e.target.value)
                      "
                    >
                      <option value="p">Paragraph</option>
                      <option value="h2">H2</option>
                      <option value="h3">H3</option>
                      <option value="h4">H4</option>
                    </select>
                    <div class="mg-mini-sep" />
                    <select
                      class="mg-mini-sel mg-mini-sel-size"
                      @change="
                        (e) => {
                          fmtBlock(idx, 'fontSize', e.target.value);
                          e.target.value = '';
                        }
                      "
                    >
                      <option value="" disabled selected>16px</option>
                      <option value="1">10</option>
                      <option value="2">12</option>
                      <option value="3">14</option>
                      <option value="4">16</option>
                      <option value="5">18</option>
                      <option value="6">24</option>
                      <option value="7">32</option>
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

                <!-- TWO-COL -->
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
                        @click.stop="fmtColRef(idx, 'col1', 'justifyLeft')"
                      >
                        <i class="bi bi-text-left" />
                      </button>
                      <button
                        class="mg-mini-btn"
                        title="Align Center"
                        @click.stop="fmtColRef(idx, 'col1', 'justifyCenter')"
                      >
                        <i class="bi bi-text-center" />
                      </button>
                      <button
                        class="mg-mini-btn"
                        title="Align Right"
                        @click.stop="fmtColRef(idx, 'col1', 'justifyRight')"
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
                      <div class="mg-mini-sep" />
                      <select
                        class="mg-mini-sel mg-mini-sel-size"
                        @change="
                          (e) => {
                            fmtColRef(idx, 'col1', 'fontSize', e.target.value);
                            e.target.value = '';
                          }
                        "
                      >
                        <option value="" disabled selected>px</option>
                        <option value="1">10</option>
                        <option value="2">12</option>
                        <option value="3">14</option>
                        <option value="4">18</option>
                        <option value="5">24</option>
                        <option value="6">32</option>
                        <option value="7">48</option>
                      </select>
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
                        @click.stop="fmtColRef(idx, 'col2', 'justifyLeft')"
                      >
                        <i class="bi bi-text-left" />
                      </button>
                      <button
                        class="mg-mini-btn"
                        title="Align Center"
                        @click.stop="fmtColRef(idx, 'col2', 'justifyCenter')"
                      >
                        <i class="bi bi-text-center" />
                      </button>
                      <button
                        class="mg-mini-btn"
                        title="Align Right"
                        @click.stop="fmtColRef(idx, 'col2', 'justifyRight')"
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
                      <div class="mg-mini-sep" />
                      <select
                        class="mg-mini-sel mg-mini-sel-size"
                        @change="
                          (e) => {
                            fmtColRef(idx, 'col2', 'fontSize', e.target.value);
                            e.target.value = '';
                          }
                        "
                      >
                        <option value="" disabled selected>px</option>
                        <option value="1">10</option>
                        <option value="2">12</option>
                        <option value="3">14</option>
                        <option value="4">18</option>
                        <option value="5">24</option>
                        <option value="6">32</option>
                        <option value="7">48</option>
                      </select>
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

                <!-- IMG-RIGHT -->
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
                      <div class="mg-mini-sep" />
                      <select
                        class="mg-mini-sel mg-mini-sel-size"
                        @change="
                          (e) => {
                            fmtSideRef(idx, 'fontSize', e.target.value);
                            e.target.value = '';
                          }
                        "
                      >
                        <option value="" disabled selected>px</option>
                        <option value="1">10</option>
                        <option value="2">12</option>
                        <option value="3">14</option>
                        <option value="4">18</option>
                        <option value="5">24</option>
                        <option value="6">32</option>
                        <option value="7">48</option>
                      </select>
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
                    <img v-if="block.img" :src="resolveImgUrl(block.img)" />
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

                <!-- IMG-LEFT -->
                <div
                  v-else-if="block.type === 'img-left'"
                  class="mg-side-editor mg-side-left"
                >
                  <div
                    class="mg-side-img-wrap"
                    @click.stop="triggerBlockImg(idx)"
                  >
                    <img v-if="block.img" :src="resolveImgUrl(block.img)" />
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
                      <div class="mg-mini-sep" />
                      <select
                        class="mg-mini-sel mg-mini-sel-size"
                        @change="
                          (e) => {
                            fmtSideRef(idx, 'fontSize', e.target.value);
                            e.target.value = '';
                          }
                        "
                      >
                        <option value="" disabled selected>px</option>
                        <option value="1">10</option>
                        <option value="2">12</option>
                        <option value="3">14</option>
                        <option value="4">18</option>
                        <option value="5">24</option>
                        <option value="6">32</option>
                        <option value="7">48</option>
                      </select>
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

                <!-- IMG-FULL -->
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

                <!-- IMG-PAIR -->
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
                          <span v-if="block._uploading1" class="mg-upload-hint"
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
                          <span v-if="block._uploading2" class="mg-upload-hint"
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

                <!-- QUOTE -->
                <div v-else-if="block.type === 'quote'" class="mg-quote-block">
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
                    <div class="mg-mini-sep" />
                    <select
                      class="mg-mini-sel mg-mini-sel-size"
                      @change="
                        (e) => {
                          fmtQuoteRef(idx, 'fontSize', e.target.value);
                          e.target.value = '';
                        }
                      "
                    >
                      <option value="" disabled selected>px</option>
                      <option value="1">10</option>
                      <option value="2">12</option>
                      <option value="3">14</option>
                      <option value="4">18</option>
                      <option value="5">24</option>
                      <option value="6">32</option>
                      <option value="7">48</option>
                    </select>
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

                <!-- CAPTION -->
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

            <!-- hidden file inputs -->
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

        <!-- SIDEBAR -->
        <div class="form-side">
          <div class="side-box">
            <div class="side-box-title">
              รูปภาพหลัก
              <span v-if="imgUploading" class="upload-badge"
                >กำลังอัปโหลด...</span
              >
            </div>
            <div
              class="img-main-dropzone"
              @click="triggerItemImg"
              @dragover.prevent
              @drop.prevent="onItemImgDrop"
            >
              <img
                v-if="form.img"
                :src="resolveImgUrl(form.img)"
                class="img-preview"
              />
              <div v-else-if="imgUploading" class="img-placeholder">
                <div class="spinner-border spinner-border-sm" role="status" />
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
            <button v-if="form.img" class="remove-img-btn">
              <i class="bi bi-trash3" @click="form.img = null" />
            </button>

            <div class="side-box-title">แบนเนอร์</div>
            <div
              class="img-dropzone"
              @click="triggerBannerImg"
              @dragover.prevent
              @drop.prevent="onBannerImgDrop"
            >
              <img
                v-if="form.bannerImg"
                :src="resolveImgUrl(form.bannerImg)"
                class="img-preview"
              />
              <div v-else-if="bannerImgUploading" class="img-placeholder">
                <div class="spinner-border spinner-border-sm" />
                <span>กำลังอัปโหลด...</span>
              </div>
              <div v-else class="img-placeholder">
                <i class="bi bi-image" /><span>คลิกหรือลากไฟล์</span>
              </div>
            </div>
            <input
              ref="bannerImgInput"
              type="file"
              accept="image/*"
              class="d-none"
              @change="onBannerImgChange"
            />
            <button v-if="form.bannerImg" class="remove-img-btn">
              <i class="bi bi-trash3" @click="form.bannerImg = null" />
            </button>
          </div>

          <div class="side-box mt-1">
            <div class="side-box-title">โพสต์</div>
            <div class="form-field">
              <label>สถานะการแสดงผล</label>
              <select v-model="form.status" class="form-select">
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div class="form-field">
              <label>วันที่</label>
              <input v-model="form.date" type="date" class="field-input" />
            </div>
            <div class="side-actions mt-1">
              <button
                class="btn-primary btn sm px-3 py-2 w-100"
                :disabled="saveLoading || imgUploading"
                @click="handleSave"
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

<script setup>
import { ref, reactive, watch, nextTick } from "vue";

// ── Props & Emits ─────────────────────────────────────
const props = defineProps({
  view: { type: String, required: true }, // 'create' | 'edit'
  initialForm: { type: Object, required: true },
  saveLoading: { type: Boolean, default: false },
  uploadImageFile: { type: Function, required: true },
  resolveImgUrl: { type: Function, required: true },
  showToast: { type: Function, required: true },
});

const emit = defineEmits(["back", "save"]);

// ── Local form state (clone so we don't mutate parent directly) ──
const form = reactive({ ...props.initialForm });

watch(
  () => props.initialForm,
  (val) => Object.assign(form, val),
  { deep: true },
);

// ── Image uploading states ────────────────────────────
const imgUploading = ref(false);
const bannerImgUploading = ref(false);

// ── File input refs ───────────────────────────────────
const itemImgInput = ref(null);
const bannerImgInput = ref(null);
const blockImgInput = ref(null);
const pairImgInput = ref(null);

// ── Magazine Editor ───────────────────────────────────
const editorBlocks = ref([]);
const activeBlock = ref(null);
const editorRefs = ref({});
const colRefs = ref({});
const sideRefs = ref({});
const quoteRefs = ref({});
const pendingImgIdx = ref(null);
const pendingPairIdx = ref(null);
const pendingPairSlot = ref(null);

// ── Expose init method for parent to call ─────────────
function initBlocks(html) {
  editorBlocks.value = deserializeBlocks(html || "");
  activeBlock.value = null;
  nextTick(() => {
    document.querySelectorAll(".mg-caption-field").forEach((el) => {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    });
  });
}

defineExpose({ initBlocks });

// ── Ref setters ───────────────────────────────────────
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

// ── Format helpers ────────────────────────────────────
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

// ── Block management ──────────────────────────────────
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

// ── Block image upload ────────────────────────────────
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
    editorBlocks.value[idx].img = await props.uploadImageFile(file);
    syncContent();
  } catch (err) {
    props.showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    editorBlocks.value[idx]._uploading = false;
  }
}

// ── Pair image upload ─────────────────────────────────
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
  editorBlocks.value[idx][`_uploading${slot}`] = true;
  try {
    editorBlocks.value[idx][`img${slot}`] = await props.uploadImageFile(file);
    syncContent();
  } catch (err) {
    props.showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    editorBlocks.value[idx][`_uploading${slot}`] = false;
  }
}

// ── Item main image ───────────────────────────────────
function triggerItemImg() {
  itemImgInput.value?.click();
}
async function onItemImgChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = "";
  imgUploading.value = true;
  try {
    form.img = await props.uploadImageFile(file);
  } catch (err) {
    props.showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    imgUploading.value = false;
  }
}
async function onItemImgDrop(e) {
  const file = e.dataTransfer.files[0];
  if (!file?.type.startsWith("image/")) return;
  imgUploading.value = true;
  try {
    form.img = await props.uploadImageFile(file);
  } catch (err) {
    props.showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    imgUploading.value = false;
  }
}

// ── Banner image ──────────────────────────────────────
function triggerBannerImg() {
  bannerImgInput.value?.click();
}
async function onBannerImgChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = "";
  bannerImgUploading.value = true;
  try {
    form.bannerImg = await props.uploadImageFile(file);
  } catch (err) {
    props.showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    bannerImgUploading.value = false;
  }
}
async function onBannerImgDrop(e) {
  const file = e.dataTransfer.files[0];
  if (!file?.type.startsWith("image/")) return;
  bannerImgUploading.value = true;
  try {
    form.bannerImg = await props.uploadImageFile(file);
  } catch (err) {
    props.showToast(err.message || "อัปโหลดรูปไม่สำเร็จ", "error");
  } finally {
    bannerImgUploading.value = false;
  }
}

// ── Serialize / Deserialize ───────────────────────────
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
  form.content = serializeBlocks();
}

watch(editorBlocks, () => syncContent(), { deep: true });

// ── Save ──────────────────────────────────────────────
function handleSave() {
  emit("save", { ...form });
}

// ── Misc ──────────────────────────────────────────────
function autoResize(e) {
  const el = e.target;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}
</script>

<style scoped>
.d-none {
  display: none;
}

/* reuse all mg-* styles from parent — copy them here so the component is self-contained */
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
  flex-wrap: wrap;
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
.mg-mini-sel-size {
  width: 52px;
  padding: 2px 4px;
}

.mg-editable {
  min-height: 80px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 16px;
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
.mg-editable font[size="1"] {
  font-size: 10px;
}
.mg-editable font[size="2"] {
  font-size: 12px;
}
.mg-editable font[size="3"] {
  font-size: 14px;
}
.mg-editable font[size="4"] {
  font-size: 16px;
}
.mg-editable font[size="5"] {
  font-size: 18px;
}
.mg-editable font[size="6"] {
  font-size: 24px;
}
.mg-editable font[size="7"] {
  font-size: 32px;
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
.mg-quote-text font[size="1"] {
  font-size: 10px;
}
.mg-quote-text font[size="2"] {
  font-size: 12px;
}
.mg-quote-text font[size="3"] {
  font-size: 14px;
}
.mg-quote-text font[size="4"] {
  font-size: 16px;
}
.mg-quote-text font[size="5"] {
  font-size: 18px;
}
.mg-quote-text font[size="6"] {
  font-size: 24px;
}
.mg-quote-text font[size="7"] {
  font-size: 32px;
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

.upload-badge {
  font-size: 10px;
  color: var(--accent);
  font-weight: 500;
}
.img-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.side-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .mg-two-col-editor,
  .mg-side-right,
  .mg-side-left,
  .mg-img-pair-grid {
    grid-template-columns: 1fr;
  }
}
</style>
