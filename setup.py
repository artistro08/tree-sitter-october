from setuptools import setup, Extension

setup(
    ext_modules=[
        Extension(
            name="tree_sitter_october",
            sources=["src/parser.c"],
            extra_compile_args=["-std=c11"],
            include_dirs=["src"]
        )
    ]
)
