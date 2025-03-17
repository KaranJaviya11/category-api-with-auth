const Category = require('../models/categoryModel');

exports.createCategory = async (req, res) => {
    try {
        const { name, parent } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
    
        const category = new Category({ name, parent: parent || null });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        const buildTree = (parentId = null) => {
            return categories
                .filter(cat => String(cat.parent) === String(parentId))
                .map(cat => ({
                    ...cat.toObject(),
                    children: buildTree(cat._id)
                }));
        };
    
        res.json(buildTree());
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, status } = req.body;

        if (!name && !status) {
            return res.status(400).json({ message: 'At least name or status must be provided' });
        }
        if (!(status == 'inactive' || status == 'active')) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const category = await Category.findByIdAndUpdate(req.params.id, { name, status }, { new: true });

        if (category) {
            const deactivateSubcategories = async (parentId) => {
                const children = await Category.find({ parent: parentId });
                for (const child of children) {
                    await Category.findByIdAndUpdate(child._id, { status: status });
                    await deactivateSubcategories(child._id);
                }
            };
            await deactivateSubcategories(category._id);
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
    
        await Category.updateMany({ parent: category._id }, { parent: category.parent });
        await category.deleteOne();
    
        res.json({ message: 'Category deleted and subcategories reassigned' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};