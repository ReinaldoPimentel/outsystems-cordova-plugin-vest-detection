# Image Labeling Guide - Vest Detection

This guide explains what to look for when labeling images for training.

## Vest = `data/train/vest/` or `data/val/vest/`

An image should be labeled as **"vest"** when:

### ✅ **CLEAR VEST DETECTION** - Include these:
- **High-visibility vest/safety vest clearly visible** (orange, yellow, green, etc.)
- **Reflective strips visible** (common on safety vests)
- **Vest covers torso/chest area** (front or back visible)
- **Vest partially visible** but recognizable (e.g., person facing sideways but vest visible)
- **Vest under other clothing** (e.g., vest worn under a jacket, but clearly visible)
- **Group photos** where at least one person is clearly wearing a vest

### ⚠️ **BORDERLINE CASES** - Include if vest is recognizable:
- Person turning sideways/back (vest on back visible)
- Vest partially covered by equipment
- Low lighting but vest still identifiable
- Small/partial view but vest pattern/color is clear

---

## No Vest = `data/train/no_vest/` or `data/val/no_vest/`

An image should be labeled as **"no_vest"** when:

### ✅ **CLEARLY NO VEST** - Include these:
- **Regular clothing only** (shirts, jackets, t-shirts - no safety vest)
- **No reflective safety equipment visible**
- **Other safety equipment but no vest** (e.g., hard hat only, gloves only)
- **Person in regular work uniform** without vest component
- **Group photos** where NO ONE is wearing a vest

### ⚠️ **CONFUSING CASES** - Usually "no_vest":
- **Orange/yellow shirt** that looks like a vest but is regular clothing (no reflective strips, different fit/cut)
- **Vest-like pattern on fabric** but it's part of regular clothing
- **Image too blurry/too dark** - can't tell if vest is present (err on side of "no_vest")
- **Person facing away** - if you can't see a vest, label as "no_vest"

---

## What to Look For: Key Visual Features

### **Safety Vest Characteristics:**
1. **Bright colors**: Orange, yellow, lime green, white
2. **Reflective strips**: Horizontal/vertical reflective bands (silver/white)
3. **Fit**: Loose-fitting, worn over other clothing
4. **Visibility**: Designed to stand out, high contrast
5. **Structure**: Usually open-front (zipper/snap) or pullover style

### **NOT a Vest (Regular Clothing):**
- Solid colored shirts (orange t-shirt ≠ vest)
- T-shirts, polos, button-down shirts
- Sweaters, hoodies, jackets (unless vest is visible underneath)
- Sports jerseys
- Regular work uniforms without vest component

---

## Edge Cases & Decision Guide

| Scenario | Label | Reason |
|----------|-------|--------|
| Person wearing orange t-shirt | `no_vest` | Regular clothing, no reflective strips |
| Safety vest clearly visible | `vest` | Clearly meets vest criteria |
| Orange vest with reflective strips | `vest` | Classic safety vest |
| Person facing away, can't see front | `no_vest` | Can't confirm vest presence |
| Vest partially visible under jacket | `vest` | Vest recognizable |
| Bright yellow shirt, no reflective strips | `no_vest` | Color alone doesn't make it a vest |
| Blurry image, can't tell | `no_vest` | When uncertain, exclude from vest category |
| Person wearing vest backwards | `vest` | Still a vest, just orientation different |
| Group photo: 2 with vest, 3 without | `vest` | At least one person has vest |
| Only safety equipment visible (no vest) | `no_vest` | No vest = no_vest |

---

## Quality Checklist

Before adding an image to training set:

### ✅ **Good Training Images:**
- [ ] Vest (or absence) is clearly identifiable
- [ ] Image is reasonably clear (not extremely blurry)
- [ ] Vest features are visible (color/reflective strips)
- [ ] Person is recognizable (you can see torso area)

### ❌ **Exclude These:**
- Extremely blurry images where you can't tell
- Images with no people visible
- Images where person is completely obscured
- Duplicate images (only keep one)
- Extremely low resolution (< 100x100 pixels)

---

## Consistency Tips

1. **When in doubt**: If you're not sure, exclude it or label as "no_vest" (better to miss a vest than include false positives)

2. **Consistency over speed**: Label consistently - if you label it one way, similar images should be labeled the same

3. **Use the "clear vest" test**: 
   - Ask: "Would another person looking at this clearly see it's a safety vest?"
   - If YES → `vest`
   - If NO or UNSURE → `no_vest`

4. **Focus on what matters**: The model learns from clear examples. Borderline/confusing cases may confuse training.

---

## Example Images for Reference

### Clear Vest Examples:
- Construction worker in orange vest with reflective strips
- Road worker in yellow safety vest
- Person in high-visibility vest at workplace
- Safety vest visible in group photo

### Clear No-Vest Examples:
- Person in regular business clothing
- Person in plain t-shirt/jeans
- Person in sports jersey
- Person in regular work uniform (no vest)

---

## Quick Decision Tree

```
Is there a high-visibility safety vest clearly visible?
├─ YES → Is it recognizable as a safety vest?
│  ├─ YES → vest/
│  └─ NO  → no_vest/
└─ NO → Are you sure there's NO vest?
   ├─ YES → no_vest/
   └─ UNSURE → no_vest/ (when uncertain, default to no_vest)
```

---

**Remember**: Consistent, clear labeling is more important than having perfect edge cases. The model will learn best from clear examples!

