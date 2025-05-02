<template>
  <div
    v-if="showComponent"
    class="dynamic-inputs-container"
  >
    <label>价格区间设置：</label>
    <div
      v-for="(range, index) in ranges"
      :key="index"
      class="input-group"
    >
      <input
        v-model.number="range.minQuantity"
        placeholder="最小数量"
        type="number"
        min="0"
        :disabled="index > 0"
        class="input-item"
        @input="validateRanges"
      >
      <span class="separator">-</span>
      <input
        v-model.number="range.maxQuantity"
        placeholder="最大数量"
        type="number"
        :min="getMinForMaxQuantity(index)"
        class="input-item"
        @input="validateRanges"
      >
      <span class="price-label">价格：</span>
      <input
        v-model.number="range.price"
        placeholder="价格"
        type="number"
        min="0"
        step="0.01"
        class="price-input"
      >
      <button
        v-if="index > 0"
        type="button"
        class="remove-btn"
        @click="removeRange(index)"
      >
        ×
      </button>
      <div
        v-if="errors[index]"
        class="error-message"
      >{{ errors[index] }}</div>
    </div>
    <button
      type="button"
      class="add-btn"
      :disabled="!canAddNewRange"
      @click="addRange"
    >
      添加价格区间
    </button>
  </div>
</template>

<script>
export default {
  name: 'DynamicRangeInputs',
  props: {
    value: {
      type: [Array, String],
      default: () => [],
      validator: (value) => {
        try {
          const parsed = typeof value === 'string' ? JSON.parse(value) : value
          return Array.isArray(parsed) || value === undefined || value === null
        } catch {
          return false
        }
      }
    },
    isAvoid: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      ranges: this.normalizeRanges(this.value),
      errors: {},
      canAddNewRange: false,
      isValid: false
    }
  },
  computed: {
    showComponent() {
      return this.isAvoid
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.ranges = this.normalizeRanges(newVal)
        this.validateRanges()
      },
      deep: true
    },
    ranges: {
      handler(newVal) {
        this.$emit('input', newVal)
        this.validateRanges()
      },
      deep: true
    }
  },
  mounted() {
    this.ranges = this.normalizeRanges(this.value)
    this.validateRanges()
  },
  methods: {
    normalizeRanges(value) {
      try {
        if (value == null) return [this.createNewRange()]
        const parsed = typeof value === 'string' ? JSON.parse(value) : value
        return Array.isArray(parsed) && parsed.length > 0
          ? parsed
          : [this.createNewRange()]
      } catch (e) {
        console.error('格式化ranges失败:', e)
        return [this.createNewRange()]
      }
    },

    createNewRange() {
      return {
        minQuantity: null,
        maxQuantity: null,
        price: null
      }
    },

    getMinForMaxQuantity(index) {
      if (index === 0) return 1
      return this.ranges[index].minQuantity
    },

    addRange() {
      if (!this.canAddNewRange) return
      const lastRange = this.ranges[this.ranges.length - 1]
      const newRange = this.createNewRange()
      newRange.minQuantity = lastRange.maxQuantity + 1
      this.ranges.push(newRange)
    },

    removeRange(index) {
      this.ranges.splice(index, 1)
    },

    validateRanges() {
      this.errors = {}
      let isValid = true
      let previousMax = null

      this.ranges.forEach((range, index) => {
        // 验证必填字段
        if (range.minQuantity === null || range.maxQuantity === null || range.price === null) {
          this.errors[index] = '请填写所有字段'
          isValid = false
          return
        }

        // 验证最小值<=最大值
        if (range.minQuantity > range.maxQuantity) {
          this.errors[index] = '最小值不能大于最大值'
          isValid = false
          return
        }

        // 验证区间连续性
        if (index > 0) {
          const expectedMin = previousMax + 1
          if (range.minQuantity !== expectedMin) {
            this.errors[index] = `最小值应为${expectedMin}`
            isValid = false
            return
          }
        }

        previousMax = range.maxQuantity
      })

      // 检查是否可以添加新区间
      const lastRange = this.ranges[this.ranges.length - 1]
      this.canAddNewRange = isValid && lastRange.maxQuantity !== null
      this.isValid = isValid

      this.$emit('validation', {
        isValid,
        errors: this.errors
      })
    }
  }
}
</script>

<style scoped>
.dynamic-inputs-container {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.input-item {
  width: 120px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.input-item:focus {
  outline: none;
  border-color: #409eff;
}

.separator {
  margin: 0 10px;
}

.price-label {
  margin-left: 20px;
}

.price-input {
  width: 120px;
  margin-right: 10px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.remove-btn {
  margin-left: 10px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background-color: #f56c6c;
  color: white;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}

.remove-btn:hover {
  background-color: #e74c3c;
}

.add-btn {
  margin-top: 10px;
  padding: 8px 16px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background-color: #409eff;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.add-btn:disabled {
  background-color: #c0c4cc;
  border-color: #c0c4cc;
  cursor: not-allowed;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  width: 100%;
  margin-top: 5px;
  margin-left: 10px;
}
</style>
