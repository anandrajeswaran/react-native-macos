# Copyright (c) Facebook, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
version = package['version']

source = { :git => 'https://github.com/facebook/react-native.git' }
if version == '1000.0.0'
  # This is an unpublished version, use the latest commit hash of the react-native repo, which we’re presumably in.
  source[:commit] = `git rev-parse HEAD`.strip
else
  source[:tag] = "v#{version}"
end

folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
folly_version = '2018.10.22.00'
boost_compiler_flags = '-Wno-documentation'

header_subspecs = {
  'ARTHeaders'                  => 'Libraries/ART/**/*.h',
  'CoreModulesHeaders'          => 'React/CoreModules/**/*.h',
  'RCTActionSheetHeaders'       => 'Libraries/ActionSheetIOS/*.h',
  'RCTAnimationHeaders'         => 'Libraries/NativeAnimation/{Drivers/*,Nodes/*,*}.{h}',
  'RCTBlobHeaders'              => 'Libraries/Blob/{RCTBlobManager,RCTFileReaderModule}.h',
  'RCTImageHeaders'             => 'Libraries/Image/*.h',
  'RCTLinkingHeaders'           => 'Libraries/LinkingIOS/*.h',
  'RCTNetworkHeaders'           => 'Libraries/Network/*.h',
  'RCTPushNotificationHeaders'  => 'Libraries/PushNotificationIOS/*.h',
  'RCTSettingsHeaders'          => 'Libraries/Settings/*.h',
  'RCTTextHeaders'              => 'Libraries/Text/**/*.h',
  'RCTVibrationHeaders'         => 'Libraries/Vibration/*.h',
}

Pod::Spec.new do |s|
  s.name                   = "React-Core"
  s.version                = version
  s.summary                = "The core of React Native."
  s.homepage               = "http://facebook.github.io/react-native/"
  s.license                = package["license"]
  s.author                 = "Facebook, Inc. and its affiliates"
  s.platforms              = { :ios => "9.0", :tvos => "9.2", :osx => "10.14" } # TODO(macOS ISS#2323203)
  s.source                 = source
  s.compiler_flags         = folly_compiler_flags + ' ' + boost_compiler_flags
  s.header_dir             = "React"
  s.framework              = "JavaScriptCore"
  s.library                = "stdc++"
  s.pod_target_xcconfig    = { "HEADER_SEARCH_PATHS" => "\"$(PODS_TARGET_SRCROOT)/ReactCommon\" \"$(PODS_ROOT)/boost-for-react-native\" \"$(PODS_ROOT)/DoubleConversion\" \"$(PODS_ROOT)/Folly\"" }
  s.user_target_xcconfig   = { "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/Headers/Private/React-Core\""}
  s.default_subspec        = "Default"

  s.subspec "Default" do |ss|
    ss.source_files           = "React/**/*.{c,h,m,mm,S,cpp}"
    ss.exclude_files          = "React/CoreModules/**/*",
                                "React/DevSupport/**/*",
                                "React/Fabric/**/*",
                                "React/Inspector/**/*",
                                "React/CxxBridge/HermesExecutorFactory.*" # TODO(macOS GH#214)
    ss.ios.exclude_files      = "React/**/RCTTV*.*",

    # [TODO(macOS ISS#2323203)
                                "**/macOS/*"
    ss.osx.exclude_files      = "React/Modules/RCTRedBoxExtraDataViewController.{h,m}",
                                "React/Profiler/RCTProfileTrampoline-{arm,arm64,i386}.S",
                                "React/Base/RCTKeyCommands.*",
                                "React/Base/RCTTV*.*",
                                "React/Views/{RCTModal*,RCTMasked*,RCTTV*,RCTWrapperViewController}.*",
                                "React/Views/RefreshControl/*",
                                "React/Views/SafeAreaView/*"
    # ]TODO(macOS ISS#2323203)

    ss.tvos.exclude_files     = "React/Modules/RCTClipboard*",
                                "React/Views/RCTDatePicker*",
                                "React/Views/RCTPicker*",
                                "React/Views/RCTRefreshControl*",
                                "React/Views/RCTSlider*",
                                "React/Views/RCTSwitch*",
    ss.private_header_files   = "React/Cxx*/*.h"
  end

  # [TODO(macOS GH#214)
  s.subspec "Hermes" do |ss|
    ss.platforms = { :osx => "10.14" }
    ss.source_files = "ReactCommon/hermes/executor/*.{cpp,h}",
                      "ReactCommon/hermes/inspector/*.{cpp,h}",
                      "ReactCommon/hermes/inspector/chrome/*.{cpp,h}",
                      "ReactCommon/hermes/inspector/detail/*.{cpp,h}"
    ss.pod_target_xcconfig = { "GCC_PREPROCESSOR_DEFINITIONS" => "HERMES_ENABLE_DEBUGGER=1" }
    ss.dependency "Folly/Futures"
    ss.dependency "hermes", "~> 0.4.1"
  end
  # ]TODO(macOS GH#214)

  s.subspec "DevSupport" do |ss|
    ss.source_files = "React/DevSupport/*.{h,mm,m}",
                      "React/Inspector/*.{h,mm,m}"

    ss.dependency "React-Core/Default", version
    ss.dependency "React-Core/RCTWebSocket", version
    ss.dependency "React-jsinspector", version
  end

  s.subspec "RCTWebSocket" do |ss|
    ss.source_files = "Libraries/WebSocket/*.{h,m}"
    ss.dependency "React-Core/Default", version
  end

  # Add a subspec containing just the headers for each
  # pod that should live under <React/*.h>
  header_subspecs.each do |name, headers|
    s.subspec name do |ss|
      ss.source_files = headers
      ss.dependency "React-Core/Default"
    end
  end

  s.dependency "Folly", folly_version
  s.dependency "React-cxxreact", version
  s.dependency "React-jsi", version
  s.dependency "React-jsiexecutor", version
  s.dependency "Yoga"
  s.dependency "glog"
end
