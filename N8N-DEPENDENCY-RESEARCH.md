# n8n Community Node Dependency Research

## Summary

Research into "cannot find module" errors affecting n8n community nodes on certain platforms (Hetzner, localhost) but not others (Railway).

## Key Findings

### 1. n8n Verified Community Node Limitations
- **Discovery**: n8n verified community nodes aren't allowed runtime dependencies
- **Impact**: This restriction causes module resolution failures when nodes attempt to load external libraries
- **Platform Variance**: Some platforms handle this better through different npm installation approaches

### 2. Platform-Specific npm Installation Issues
- **Hetzner/Localhost**: Inconsistent npm installation behavior leads to missing modules
- **Railway**: Better handling of dependency resolution and module paths
- **Root Cause**: Platform-specific npm caching and node_modules structure differences

### 3. Identified Workarounds

#### Option 1: Full Webpack Bundling
- Bundle all dependencies directly into the node files
- Eliminates runtime dependency resolution
- Increases bundle size but ensures compatibility

#### Option 2: Environment Variables
- Use N8N_CUSTOM_EXTENSIONS path configuration
- Set N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
- Requires manual server configuration

#### Option 3: Manual Installation
- Pre-install dependencies in the n8n environment
- Requires access to the deployment environment
- Not viable for community distribution

### 4. n8n Version Updates
- **n8n 1.69.0+**: Fixed community package installation issues
- **Recommendation**: Users should upgrade to latest n8n version
- **Backwards Compatibility**: Older versions still require workarounds

## Implementation Strategy

Based on this research, the SuperCode node package has been updated to:
1. Move all libraries from devDependencies to dependencies section
2. Implement webpack bundling for critical dependencies
3. Use lazy loading to minimize memory footprint
4. Provide fallback mechanisms for missing modules

## Testing Results

- **Hetzner**: Fixed with dependency restructuring
- **Railway**: Continued working as expected
- **Localhost**: Resolved with proper dependency configuration
- **n8n Cloud**: Compatible with all approaches

## Recommendations

1. Always place required libraries in `dependencies` (not `devDependencies`)
2. Use webpack bundling for critical path dependencies
3. Implement graceful fallbacks for optional libraries
4. Test on multiple platforms during development
5. Document platform-specific installation requirements

## References

- n8n Community Nodes Documentation
- npm Module Resolution Algorithm
- Platform-specific deployment guides
- Version compatibility matrix