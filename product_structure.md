# Volt Marketplace: Product Taxonomy & Database Schema

## 1. Data Schema Fields

Every product entry must include the following metadata fields to support search, filtering, and categorization:

* **organization**: The Brand or Company name (e.g., Nike, Stripe).
* **product_type**: Top-level classification (Physical | Digital).
* **category**: Industry-level grouping.
* **subcategory**: Specific product classification.

---

## 2. Taxonomy Hierarchy

### [Type] Physical Products

* **Category: Fashion & Lifestyle**
  * Subcategories: Clothing, Shoes, Bags, Accessories, Jewelry, Skincare, Haircare
* **Category: Electronics & Gadgets**
  * Subcategories: Phones, Laptops, Tablets, Accessories

### [Type] Digital Products

* **Category: Fintech**
  * Subcategories: Fintech App Signup, Fintech App Install / Download
* **Category: Tech Products**
  * Subcategories: Tech Product Signup, Tech Product Install / Download
* **Category: Software & Tools**
  * Subcategories: Software / Tools Signup
* **Category: Subscriptions**
  * Subcategories: Subscriptions

---

## 3. Marketplace Filter Logic

The Volt Marketplace search interface must utilize the following filter mapping:

| Filter UI Label | Database Field Mapping |
| :--- | :--- |
| **Brand** | `organization` |
| **Product Type** | `product_type` (Value: Digital or Physical) |
| **Category** | `category` |

---

## 4. Object Example (JSON)

```json
{
  "product_name": "Volt Premium Plus",
  "organization": "Volt Tech",
  "product_type": "Digital",
  "category": "Subscriptions",
  "subcategory": "Subscriptions"
}
