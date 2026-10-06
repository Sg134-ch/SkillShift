import os
import pytest
import zipfile
from scripts.generate_presentation import main as generate_main, SLIDES_DATA

def test_presentation_generation_and_validity():
    """Builds and verifies the 17-slide infographic presentation files."""
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pptx_path = os.path.join(root_dir, "SkillShift_Presentation.pptx")
    odf_path = os.path.join(root_dir, "SkillShift_Presentation.odf")
    odp_path = os.path.join(root_dir, "SkillShift_Presentation.odp")
    
    # Execute generation
    generate_main()
    
    # Assert slide count satisfies requested boundary (15 to 20 slides)
    assert 15 <= len(SLIDES_DATA) <= 20
    assert len(SLIDES_DATA) == 17
    
    # Verify PPTX file
    assert os.path.exists(pptx_path)
    assert os.path.getsize(pptx_path) > 1000
    with zipfile.ZipFile(pptx_path, 'r') as z:
        namelist = z.namelist()
        assert '[Content_Types].xml' in namelist
        assert 'ppt/presentation.xml' in namelist
        
    # Verify ODF file
    assert os.path.exists(odf_path)
    assert os.path.getsize(odf_path) > 1000
    with zipfile.ZipFile(odf_path, 'r') as z:
        namelist = z.namelist()
        assert 'mimetype' in namelist
        assert 'META-INF/manifest.xml' in namelist
        assert 'content.xml' in namelist
        
    # Verify ODP file
    assert os.path.exists(odp_path)
    assert os.path.getsize(odp_path) > 1000
